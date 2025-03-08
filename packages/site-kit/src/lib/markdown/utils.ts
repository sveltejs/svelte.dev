import { Marked, Renderer, type TokenizerObject, type MarkedExtension } from 'marked';
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

const HTML_TAGS_REGEX = /<[^>]*>/g;
const IMAGES_REGEX = /!\[([^\]]*)\]\([^)]*\)/g;
const LINKS_REGEX = /\[([^\]]*)\]\([^)]*\)/g;
const HEADERS_REGEX = /^#+\s+(.*)$/gm;
const BLOCKQUOTES_REGEX = /^>\s+(.*)$/gm;
const HORIZONTAL_RULES_REGEX = /^(---|___|\*\*\*)\s*$/gm;
const STRONG_EMPHASIS_REGEX = /(\*\*|__)(.*?)\1/g;
const REGULAR_EMPHASIS_REGEX = /(\*|_)(.*?)\1/g;
const INLINE_CODE_REGEX = /`([^`]*)`/g;
const FENCED_CODE_BLOCKS_REGEX = /```[\s\S]*?```/g;
const INDENTED_CODE_BLOCKS_REGEX = /^( {4}|\t).*$/gm;
const TASK_LISTS_REGEX = /^[ \t]*- \[[xX ]\] /gm;
const ORDERED_LIST_REGEX = /^\s*\d+\.\s+/gm;
const UNORDERED_LIST_REGEX = /^\s*[*\-+]\s+/gm;
const FOOTNOTES_REGEX = /\[\^[^\]]*\](?:\[[^\]]*\]|\([^)]*\))?/g;
const REFERENCE_LINKS_REGEX = /^\s*\[[^\]]*\]:\s+.*$/gm;
const STRIKETHROUGH_REGEX = /~~(.*?)~~/g;
const TABLE_PIPES_REGEX = /^\|(.+)\|$/gm;
const PIPE_CHAR_REGEX = /\|/g;
const TABLE_HEADER_REGEX = /^[-:| ]+$/gm;
const MULTIPLE_NEWLINES_REGEX = /\n{3,}/g;
const MULTIPLE_SPACES_REGEX = /[ \t]+/g;

/**
 * Converts Markdown formatted text to plain text by removing all Markdown syntax
 *
 * @param markdown The Markdown formatted text
 * @returns Plain text with Markdown syntax removed
 */
export function markdown_to_plain_text(markdown: string): string {
	if (!markdown) return '';

	let text = markdown;

	// Remove HTML tags (including tags in the markdown)
	text = text.replace(HTML_TAGS_REGEX, '');

	// Remove images ![alt text](url)
	text = text.replace(IMAGES_REGEX, '$1');

	// Replace links [text](url) with just the text
	text = text.replace(LINKS_REGEX, '$1');

	// Remove headers (# Header)
	text = text.replace(HEADERS_REGEX, '$1');

	// Remove blockquotes (> quote)
	text = text.replace(BLOCKQUOTES_REGEX, '$1');

	// Remove horizontal rules (---, ***, ___)
	text = text.replace(HORIZONTAL_RULES_REGEX, '');

	// Remove emphasis (* and _)
	text = text.replace(STRONG_EMPHASIS_REGEX, '$2'); // Strong emphasis (bold)
	text = text.replace(REGULAR_EMPHASIS_REGEX, '$2'); // Regular emphasis (italic)

	// Remove inline code (`code`)
	text = text.replace(INLINE_CODE_REGEX, '$1');

	// Remove code blocks
	text = text.replace(FENCED_CODE_BLOCKS_REGEX, ''); // Fenced code blocks
	text = text.replace(INDENTED_CODE_BLOCKS_REGEX, ''); // Indented code blocks

	// Remove task lists
	text = text.replace(TASK_LISTS_REGEX, '- ');

	// Remove ordered list markers
	text = text.replace(ORDERED_LIST_REGEX, '');

	// Remove unordered list markers
	text = text.replace(UNORDERED_LIST_REGEX, '');

	// Remove footnotes
	text = text.replace(FOOTNOTES_REGEX, '');

	// Remove reference-style link definitions
	text = text.replace(REFERENCE_LINKS_REGEX, '');

	// Remove strikethrough
	text = text.replace(STRIKETHROUGH_REGEX, '$1');

	// Convert tables to plain text (simple approach)
	text = text.replace(TABLE_PIPES_REGEX, '$1'); // Remove outer table pipes
	text = text.replace(PIPE_CHAR_REGEX, ' '); // Replace remaining pipes with spaces
	text = text.replace(TABLE_HEADER_REGEX, ''); // Remove table header separator row

	// Clean up excessive whitespace
	text = text.replace(MULTIPLE_NEWLINES_REGEX, '\n\n'); // Replace 3+ newlines with 2
	text = text.replace(MULTIPLE_SPACES_REGEX, ' '); // Replace multiple spaces/tabs with single space
	text = text.trim(); // Trim leading/trailing whitespace

	return text;
}
