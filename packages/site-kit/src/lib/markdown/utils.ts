import { Marked, type Renderer, type TokenizerObject, type MarkedExtension } from 'marked';
import json5 from 'json5';

export const SHIKI_LANGUAGE_MAP = {
	bash: 'bash',
	env: 'bash',
	html: 'svelte',
	svelte: 'svelte',
	sv: 'svelte',
	js: 'javascript',
	dts: 'typescript',
	css: 'css',
	ts: 'typescript',
	'': ''
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
	return markdown
		.replace(/(?:^|b)\*\*(.+?)\*\*(?:\b|$)/g, '$1') // bold
		.replace(/(?:^|b)_(.+?)_(?:\b|$)/g, '$1') // Italics
		.replace(/(?:^|b)\*(.+?)\*(?:\b|$)/g, '$1') // Italics
		.replace(/(?:^|b)`(.+?)`(?:\b|$)/g, '$1') // Inline code
		.replace(/(?:^|b)~~(.+?)~~(?:\b|$)/g, '$1') // Strikethrough
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Link
		.replace(/\n/g, ' ') // New line
		.replace(/ {2,}/g, ' ')
		.trim();
}

export const slugify = (str: string) => {
	return clean(str)
		.replace(/(’|&rsquo;)/g, "'")
		.replace(/&.+?;/g, '')
		.replace(/<\/?.+?>/g, '')
		.replace(/\.\.\./g, '')
		.replace(/[^a-zA-Z0-9-$(.):'_]/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-/, '')
		.replace(/-$/, '');
};

export function smart_quotes(
	str: string,
	{ first = true, html = false }: { first?: boolean; html?: boolean } = {}
) {
	// replace dumb quotes with smart quotes. This isn't a perfect algorithm — it
	// wouldn't correctly handle `That '70s show` or `My country 'tis of thee`
	// but a) it's very unlikely they'll occur in our docs, and
	// b) they can be dealt with manually
	return str.replace(
		html ? /(.|^)(&#39;|&quot;)(.|$)/g : /(.|^)('|")(.|$)/g,
		(m, before, quote, after) => {
			const left = (first && before === '') || [' ', '\n', '('].includes(before);
			let replacement = '';

			if (html) {
				const double = quote === '&quot;';
				replacement = `&${left ? 'l' : 'r'}${double ? 'd' : 's'}quo;`;
			} else {
				const double = quote === '"';
				replacement = double ? (left ? '“' : '”') : left ? '‘' : '’';
			}

			return (before ?? '') + replacement + (after ?? '');
		}
	);
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
