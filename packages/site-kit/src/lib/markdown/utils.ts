import { Marked, type Renderer, type TokenizerObject, type MarkedExtension } from 'marked';
import json5 from 'json5';

// helps map a highlighter for languages not recognised or aliased by Shiki
// see https://shiki.style/languages for a full list of official languages
export const SHIKI_LANGUAGE_MAP = {
	env: 'dotenv',
	html: 'svelte',
	sv: 'svelte',
	dts: 'typescript',
	json: 'jsonc',
	// we don't need the coffeescript highlighter because it's only used once
	// in a blog post from 2019
	cson: '',
	// there's no syntax highlighter for tree syntax
	tree: '',
	'': '',
	// already recognised by Shiki but they're here to satisfy TypeScript
	js: 'js',
	ts: 'ts'
};

export function is_in_code_block(body: string, index: number) {
	const code_blocks = [...body.matchAll(/(`{3,}).*\n(.|\n)+?\1/gm)].map((match) => {
		return [match.index ?? 0, match[0].length + (match.index ?? 0)] as const;
	});

	return code_blocks.some(([start, end]) => {
		if (index >= start && index <= end) return true;
		return false;
	});
}

/**
 * Strip styling/links etc from markdown
 */
export function clean(markdown: string) {
	return (
		markdown
			.replace(/(?:^|b)\*\*(.+?)\*\*(?:\b|$)/g, '$1') // bold
			.replace(/(?:^|b)_(.+?)_(?:\b|$)/g, '$1') // Italics
			.replace(/(?:^|b)\*(.+?)\*(?:\b|$)/g, '$1') // Italics
			// italic markdown notation such as "bind:_property_ for components"
			// should be stripped without affecting compiler error titles such as "animation_missing_key"
			.replace(/:_(.*)_ /g, ':$1 ')
			.replace(/(?:^|b)`(.+?)`(?:\b|$)/g, '$1') // Inline code
			.replace(/(?:^|b)~~(.+?)~~(?:\b|$)/g, '$1') // Strikethrough
			.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Link
			.replace(/\n/g, ' ') // New line
			.replace(/ {2,}/g, ' ')
			.trim()
	);
}

export function decode_html_entities(text: string): string {
	return text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
			return String.fromCharCode(parseInt(hex, 16));
		})
		.replace(/&#(\d+);/g, (_, dec) => {
			return String.fromCharCode(parseInt(dec, 10));
		});
}

export const slugify = (str: string) => {
	return (
		decode_html_entities(clean(str).replace(/(’|&rsquo;)/g, "'"))
			// removes <code>...</code> or <em>...</em> etc, but leaves the contents intact
			.replace(/<([a-z\-]+)>(.*?)<\/\1>/g, '$2')
			// <audio> should be converted to audio
			// <details bind:open> should be converted to details-bind-open
			// <script module> should be converted to script-module
			// <script lang="ts"> should be converted to script-lang-ts

			.replace(/[<>]/g, '')
			.replace(/\.\.\./g, '')
			.replace(/[^a-zA-Z0-9-$(.):'_]/g, '-')
			.replace(/-{2,}/g, '-')
			.replace(/^-/, '')
			.replace(/-$/, '')
	);
};

/**
 * Replace dumb quotes with smart quotes. This isn't a perfect algorithm — it
 * wouldn't correctly handle `That '70s show` or `My country 'tis of thee` but
 * a) it's very unlikely they'll occur in our docs, and
 * b) they can be dealt with manually
 */
export function smart_quotes(
	str: string,
	{
		first = true,
		html = false
	}: {
		/** True if the string is the entire sentence or false if it's a substring. @default true */
		first?: boolean;
		/** True if the string has HTML entities. @default false */
		html?: boolean;
	} = {}
) {
	const stack: Array<"'" | '"'> = [];
	let res = '';
	const len = str.length;
	const opening_squo_chars = /[\s\n\(]/;
	for (let index = 0; index < len; index++) {
		const char = str.charAt(index);
		const before = str.charAt(index - 1);
		if (html && char === '&') {
			if (str.slice(index, index + 5) === '&#39;') {
				const left: boolean =
					stack.at(-1) !== "'" && (opening_squo_chars.test(before) || (first && before === ''));
				res += `&${left ? 'l' : 'r'}squo;`;
				index += 4;
				if (!left) {
					stack.pop();
				} else {
					stack.push("'");
				}
			} else if (str.slice(index, index + 6) === '&quot;') {
				const left: boolean = stack.at(-1) !== '"';
				res += `&${left ? 'l' : 'r'}dquo`;
				index += 5;
				if (!left) {
					stack.pop();
				} else {
					stack.push('"');
				}
			} else {
				res += '&';
			}
		} else if (!html && (char === '"' || char === "'")) {
			const left: boolean =
				stack.at(-1) !== char &&
				(opening_squo_chars.test(char) || (first && before === '') || char === '"');
			const double = char === '"';
			res += double ? (left ? '“' : '”') : left ? '‘' : '’';
			if (!left) {
				stack.pop();
			} else {
				stack.push(char);
			}
		} else {
			res += char;
		}
	}
	return res;
}

const tokenizer: TokenizerObject = {
	url(src) {
		// if `src` is a package version string, eg: adapter-auto@1.2.3
		// do not tokenize it as email
		if (/@\d+\.\d+\.\d+/.test(src)) {
			return undefined;
		}
		// else, use the default tokenizer behavior
		return false;
	}
};

export async function transform(
	markdown: string,
	{
		walkTokens,
		...renderer
	}: Partial<Renderer> & { walkTokens?: MarkedExtension['walkTokens'] } = {}
) {
	const marked = new Marked({
		async: true,
		renderer,
		tokenizer,
		walkTokens
	});

	return (await marked.parse(markdown)) ?? '';
}

export function extract_frontmatter(markdown: string) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) return { metadata: {}, body: markdown };

	const frontmatter = match[1];
	const body = markdown.slice(match[0].length).trim();

	const metadata: Record<string, string> = {};

	// Prettier might split things awkwardly, so we can't just go line-by-line

	let key = '';
	let value = '';

	for (const line of frontmatter.split('\n')) {
		const match = /^(\w+):\s*(.*)$/.exec(line);
		if (match) {
			if (key) metadata[key] = parse(value);

			key = match[1];
			value = match[2];
		} else {
			value += '\n' + line;
		}
	}

	if (key) metadata[key] = parse(value);

	return { metadata, body };
}

const parse = (str: string) => {
	try {
		return json5.parse(str);
	} catch (err) {
		return str;
	}
};

/**
 * Type declarations include fully qualified URLs so that they become links when
 * you hover over names in an editor with TypeScript enabled. We need to remove
 * the origin so that they become root-relative, so that they work in preview
 * deployments and when developing locally
 */
export function strip_origin(str: string) {
	return str.replaceAll('https://svelte.dev', '');
}
