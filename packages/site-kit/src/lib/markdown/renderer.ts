import MagicString from 'magic-string';
import { createHash, type Hash } from 'node:crypto';
import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import ts from 'typescript';
import * as marked from 'marked';
import { language as create_bash_highlighter } from '@twinkleplop/bash';
import { language as create_css_highlighter } from '@twinkleplop/css';
import { language as create_dotenv_highlighter } from '@twinkleplop/dotenv';
import { language as create_html_highlighter } from '@twinkleplop/html';
import { language as create_http_highlighter } from '@twinkleplop/http';
import { language as create_ini_highlighter } from '@twinkleplop/ini';
import { language as create_javascript_highlighter } from '@twinkleplop/javascript';
import { language as create_json_highlighter } from '@twinkleplop/json';
import { language as create_jsonc_highlighter } from '@twinkleplop/jsonc';
import { language as create_markdown_highlighter } from '@twinkleplop/markdown';
import { language as create_shellsession_highlighter } from '@twinkleplop/shellsession';
import { language as create_svelte_highlighter } from '@twinkleplop/svelte';
import { language as create_toml_highlighter } from '@twinkleplop/toml';
import { create_highlighter as create_twoslash_highlighter } from '@twinkleplop/twoslash';
import { language as create_typescript_highlighter } from '@twinkleplop/typescript';
import { language as create_yaml_highlighter } from '@twinkleplop/yaml';
import { compress_and_encode_text } from 'gzip';
import { create_tree_highlighter } from './tree.ts';
import {
	decode_html_entities,
	TWINKLEPLOP_LANGUAGE_MAP,
	slugify,
	smart_quotes,
	transform
} from './utils.ts';

interface SnippetOptions {
	file: string | null;
	link: boolean;
	copy: boolean;
}

type TwoslashBanner = (filename: string, content: string) => string;

// Supports js, svelte, yaml files
const METADATA_REGEX =
	/(?:<!---\s*|\/\/\/\s*|###\s*)(?<key>file|link|copy):\s*(?<value>.*?)(?:\s*--->|$)\n/gm;

type Highlighter = ReturnType<typeof create_typescript_highlighter>;

const highlighters: Record<string, Highlighter> = {
	bash: create_bash_highlighter(),
	css: create_css_highlighter(),
	dotenv: create_dotenv_highlighter(),
	html: create_html_highlighter(),
	http: create_http_highlighter(),
	ini: create_ini_highlighter(),
	javascript: create_javascript_highlighter(),
	json: create_json_highlighter(),
	jsonc: create_jsonc_highlighter(),
	markdown: create_markdown_highlighter(),
	shellsession: create_shellsession_highlighter(),
	svelte: create_svelte_highlighter(),
	toml: create_toml_highlighter(),
	tree: create_tree_highlighter(),
	typescript: create_typescript_highlighter(),
	yaml: create_yaml_highlighter()
};

const twoslash_highlighters = new Map<string, (code: string) => string>();

function escape_html(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function highlight_source(source: string, language: string) {
	const mapped =
		TWINKLEPLOP_LANGUAGE_MAP[language as keyof typeof TWINKLEPLOP_LANGUAGE_MAP] ?? language;
	const highlight = highlighters[mapped];

	return highlight
		? highlight(source)
		: `<pre class="twinkleplop plaintext"><code>${escape_html(source)}</code></pre>`;
}

// TODO: replace with marked.parseInline once twinkleplop is fixed
// see https://github.com/pngwn/twinkleplop/issues/107
const docs_markdown = new marked.Marked({
	renderer: {
		code({ text, lang }) {
			return `<div class="code-block"><div class="controls"><button class="copy-to-clipboard raised" title="Copy to clipboard" aria-label="Copy to clipboard"></button></div>${highlight_source(text, lang ?? '')}</div>`;
		}
	}
});

function get_twoslash_highlighter(language: 'js' | 'ts', twoslashRoot?: string) {
	const key = `${language}:${twoslashRoot ?? ''}`;
	let highlight = twoslash_highlighters.get(key);

	if (!highlight) {
		highlight = create_twoslash_highlighter({
			lang: language,
			render_docs: (markdown) => docs_markdown.parse(markdown, { async: false }),
			process_type: (type) => type.replace(/import\(".*?"\)\./g, ''),
			twoslash: {
				...(twoslashRoot ? { vfsRoot: twoslashRoot } : {}),
				compilerOptions: {
					allowJs: true,
					checkJs: true,
					module: ts.ModuleKind.ESNext,
					moduleResolution: ts.ModuleResolutionKind.Bundler,
					types: ['svelte', '@sveltejs/kit', 'sv', '@sveltejs/sv-utils']
				}
			}
		});
		twoslash_highlighters.set(key, highlight);
	}

	return highlight;
}

// Hash the contents of this file and its dependencies so that we get a new cache in case we have changed
// how the markdown is rendered (whose logic live here). This is to avoid serving stale code snippets.
const hash = createHash('sha256');
hash.update(fs.readFileSync('../../pnpm-lock.yaml', 'utf-8'));
// CAREFUL: update this URL in case you ever move this file or start the dev/build process from another directory
const original_file = '../../packages/site-kit/src/lib/markdown/renderer.ts';
if (!fs.existsSync(original_file)) {
	throw new Error(
		'Update the path to the markdown renderer code. Current value: ' +
			original_file +
			' | Current cwd: ' +
			process.cwd()
	);
}
hash_graph(hash, original_file);
const digest = hash.digest().toString('base64').replace(/\//g, '-');

/**
 * Utility function to work with code snippet caching.
 *
 * @example
 *
 * ```js
 * const SNIPPETS_CACHE = create_snippet_cache(true);
 *
 * const { uid, code } = SNIPPETS_CACHE.get(source);
 *
 * // Later to save the code to the cache
 * SNIPPETS_CACHE.save(uid, processed_code);
 * ```
 */
async function create_snippet_cache() {
	const cache = new Map<string, string[]>();
	const directory = find_nearest_node_modules(import.meta.url) + '/.snippets';
	const current = `${directory}/${digest}`;

	if (fs.existsSync(directory)) {
		for (const dir of fs.readdirSync(directory)) {
			if (dir !== digest) {
				fs.rmSync(`${directory}/${dir}`, { force: true, recursive: true });
			}
		}
	} else {
		fs.mkdirSync(directory);
	}

	try {
		fs.mkdirSync(`${directory}/${digest}`);
	} catch {}

	function get_file(source: string) {
		const hash = createHash('sha256');
		hash.update(source);
		const digest = hash.digest().toString('base64').replace(/\//g, '-');

		return `${current}/${digest}.json`;
	}

	return {
		get(source: string) {
			let snippet = cache.get(source);

			if (snippet === undefined) {
				const file = get_file(source);

				if (fs.existsSync(file)) {
					const json = fs.readFileSync(file, 'utf-8');
					snippet = JSON.parse(json) as string[];
					cache.set(source, snippet);
				}
			}

			return snippet;
		},
		save(source: string, data: string[]) {
			cache.set(source, data);

			try {
				fs.mkdirSync(directory);
			} catch {}

			fs.writeFileSync(get_file(source), JSON.stringify(data));
		}
	};
}

const snippets = await create_snippet_cache();

/**
 * A super markdown renderer function. Renders svelte and kit docs specific specific markdown code to html.
 *
 * - Syntax Highlighting -> Twinkleplop language renderers.
 * - TS hover snippets -> Twinkleplop Twoslash. JS and TS code snippets (other than d.ts) are run through Twoslash.
 * - JS -> TS conversion -> JS snippets starting with `/// file: some_file.js` are converted to TS if possible. Same for Svelte snippets starting with `<!--- file: some_file.svelte --->`. Notice there's an additional dash(-) to the opening and closing comment tag.
 * - Type links -> Type names are converted to links to the type's documentation page.
 * - Snippet caching -> To avoid slowing down initial page render time, code snippets are cached in the nearest `node_modules/.snippets` folder. This is done by hashing the code snippet with SHA256 algo and storing the final rendered output in a file named the hash.
 *
 * ## Special syntax
 *
 * ### file
 *
 * Provided as a comment at top of a code snippet. If inside a JS code snippet, expects a triple slash comment as the first line(/// file:)
 *
 * ````md
 *  ```js
 *  /// file: some_file.js
 *  const a = 1;
 *  ```
 * ````
 *
 * ---
 *
 * For svelte snippets, we use HTML comments, with an additional dash at the opening and end
 *
 * ````md
 * ```svelte
 * <!--- file: some_file.svelte --->
 * <script>
 * 	const a = 1;
 * </script>
 *
 * Hello {a}
 * ```
 * ````
 *
 * ---
 *
 * ### link
 *
 * Provided at the top. Should be under `file:` if present.
 *
 * This doesn't allow the imported members from `svelte/*` or `@sveltejs/kit` to be linked, as in they are not wrapped with an `<a href="#type-onmount"></a>`.
 *
 * ````md
 * ```js
 * /// file: some_file.js
 * /// link: false
 * import { onMount } from 'svelte';
 *
 * onMount(() => {
 * 	console.log('mounted');
 * });
 * ```
 * ````
 *
 * ---
 *
 * ### copy
 *
 * Explicitly specify whether the code snippet should have a copy button on it.
 * By default, snippets with a `file` flag will get a copy button.
 * Passing `copy: false` will take higher precedence
 *
 * ````md
 * ```js
 * /// file: some_file.js
 * /// copy: false
 * const a = 1;
 *
 * console.log(a);
 * ```
 * ````
 *
 * @param {string} filename
 * @param {string} body
 * @param {object} options
 * @param {TwoslashBanner} [options.twoslashBanner] - A function that returns a string to be prepended to the code snippet before running the code with twoslash. Helps in adding imports from svelte or sveltekit or whichever modules are being globally referenced in all or most code snippets.
 * @param {Record<string, string>} [references] - Optional map of symbol names to their documentation URLs for dynamic reference links in twoslash tooltips.
 * @param {(href: string) => string} [options.transformLink] - Transforms Markdown link destinations before rendering.
 */

/**
 * Extracts imported symbol names from source code (handles JS/TS/Svelte files).
 * Only tracks imports from documented modules to avoid linking to external symbols.
 */
function extractImportedSymbols(source: string): Set<string> {
	const imported = new Set<string>();
	const scriptMatch = source.match(/<script[^>]*>([\s\S]+?)<\/script>/);
	const codeToScan = scriptMatch ? scriptMatch[1] : source;
	const importRegex = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;

	for (const match of codeToScan.matchAll(importRegex)) {
		const [, imports, module] = match;
		const documentedModules = ['svelte', '@sveltejs/kit', '$app/', '$env/', '$service-worker'];
		if (!documentedModules.some((prefix) => module.startsWith(prefix))) continue;

		// Extract symbol names, handling: { a, b as c, type d }
		for (const item of imports.split(',')) {
			const name = item
				.trim()
				.replace(/^type\s+/, '')
				.split(/\s+as\s+/)[0]
				.trim();
			if (name) imported.add(name);
		}
	}

	return imported;
}

function find_closing_span(html: string, open_index: number) {
	let depth = 1;
	let position = html.indexOf('>', open_index) + 1;

	while (depth > 0 && position < html.length) {
		const next_open = html.indexOf('<span', position);
		const next_close = html.indexOf('</span>', position);

		if (next_close === -1) return -1;

		if (next_open !== -1 && next_open < next_close) {
			depth += 1;
			position = next_open + 5;
		} else {
			depth -= 1;
			if (depth === 0) return next_close;
			position = next_close + 7;
		}
	}

	return -1;
}

/** Adds reference links for imported symbols to their Twoslash popovers. */
function injectReferenceLinks(
	html: string,
	references?: Record<string, string>,
	importedSymbols?: Set<string>
): string {
	if (!references || !importedSymbols || html.includes('twoslash-popup-reference')) {
		return html;
	}

	const insertions: Array<{ index: number; content: string }> = [];

	for (const match of html.matchAll(/<span class="twoslash-hover">/g)) {
		const hover_end = find_closing_span(html, match.index);
		const target_start = html.indexOf('<span class="twoslash-target">', match.index);

		if (hover_end === -1 || target_start === -1 || target_start > hover_end) continue;

		const target_end = find_closing_span(html, target_start);
		if (target_end === -1) continue;

		const target_content_start = html.indexOf('>', target_start) + 1;
		const symbol = decode_html_entities(
			html.slice(target_content_start, target_end).replace(/<[^>]+>/g, '')
		).trim();

		if (!importedSymbols.has(symbol)) continue;

		const url = references[symbol];
		const popover_start = html.indexOf('<span class="twoslash-popover"', target_end);
		if (!url || popover_start === -1 || popover_start > hover_end) continue;

		const popover_end = find_closing_span(html, popover_start);
		if (popover_end === -1) continue;

		insertions.push({
			index: popover_end,
			content: `<span class="twoslash-popup-reference"><a href="${url}">reference</a></span>`
		});
	}

	for (let i = insertions.length - 1; i >= 0; i--) {
		const { index, content } = insertions[i];
		html = html.slice(0, index) + content + html.slice(index);
	}

	return html;
}

export async function render_content_markdown(
	filename: string,
	body: string,
	options?: {
		check?: boolean;
		references?: Record<string, string>;
		transformLink?: (href: string) => string;
		twoslashRoot?: string;
	},
	twoslashBanner?: TwoslashBanner
) {
	const headings: string[] = [];
	const { check = true, references, transformLink, twoslashRoot } = options ?? {};

	interface CodeBlockFile {
		selected: boolean;
		tab_id: string;
		panel_id: string;
		name: string | null;
		ext: string | null;
		content: string;
		rendered: string[];
		can_copy: boolean;
	}

	interface CodeBlock {
		id: number;
		title: string | null;
		selected: string | null;
		files: CodeBlockFile[];
		converted: boolean;
		hash: string | null;
	}

	const codeblocks: CodeBlock[] = [];
	let current_block: CodeBlock | null = null;

	let transformed = await transform(body, {
		async walkTokens(token) {
			if (token.type === 'link' && transformLink) {
				token.href = transformLink(token.href);
			}

			if (token.type === 'html') {
				if (token.text.startsWith('<!-- codeblock:start')) {
					if (current_block !== null) {
						throw new Error('Cannot nest codeblocks');
					}

					const match = /<!-- codeblock:start ({.+}) -->/.exec(token.text);
					const { title = 'Demo (from docs)', selected = 'App.svelte' } = match
						? JSON.parse(match[1])
						: {};

					current_block = {
						id: codeblocks.length,
						title,
						selected,
						files: [],
						converted: false,
						hash: null
					};

					return;
				}

				if (token.text.trim() === '<!-- codeblock:end -->') {
					const block = current_block!;

					const playground = {
						name: block.title,
						files: block.files.map((file) => {
							const name = file.name! + file.ext!;

							return {
								basename: name,
								contents: file.content,
								name,
								text: true,
								type: 'file'
							};
						}),
						tailwind: false
					};

					codeblocks.push(block);
					current_block = null;

					const json = JSON.stringify(playground);
					block.hash = await compress_and_encode_text(json);

					return;
				}
			}

			if (token.type === 'code') {
				let codeblock = current_block;

				if (codeblock === null) {
					// create a one-file codeblock
					codeblock = {
						id: codeblocks.length,
						title: null,
						selected: null,
						files: [],
						converted: false,
						hash: null
					};

					codeblocks.push(codeblock);
				}

				const decodedText = decode_html_entities(token.text);

				if (token.lang === 'diff') {
					throw new Error('Use +++ and --- annotations instead of diff blocks');
				}

				let { source, options } = parse_options(decodedText, token.lang);
				const leading_frontmatter_delimiters = get_leading_frontmatter_delimiters(
					source,
					token.lang
				);
				source = adjust_tab_indentation(source, token.lang);

				if (options.file && !options.file.includes('.')) {
					throw new Error(`Missing file extension: ${options.file}`);
				}

				let prelude = '';

				if ((token.lang === 'js' || token.lang === 'ts') && check) {
					const match = /((?:[\s\S]+)\/\/ ---cut---\n)?([\s\S]+)/.exec(source)!;
					[, prelude = '// ---cut---\n', source] = match;

					const banner = twoslashBanner?.(filename, source);
					if (banner)
						prelude =
							'// @filename: injected.d.ts\n' +
							banner +
							(options.file ? `\n// @filename: ${options.file.split('/').pop()}\n` : '\n') +
							prelude;
				}

				source = source.replace(
					/(\+\+\+|---|:::)/g,
					(match, delimiter: keyof typeof delimiter_substitutes, offset) => {
						if (match === '---' && leading_frontmatter_delimiters.has(offset)) {
							return match;
						}

						return delimiter_substitutes[delimiter];
					}
				);

				const ext = options.file?.slice(options.file.lastIndexOf('.'));

				const file: CodeBlockFile = {
					selected: options.file === codeblock.selected,
					tab_id: `playground-tab-${codeblock.id}-${codeblock.files.length}`,
					panel_id: `playground-tabpanel-${codeblock.id}-${codeblock.files.length}`,
					name: options.file?.slice(0, -ext!.length) ?? null,
					ext: ext ?? null,
					content: source
						.replace(delimiter_patterns['---'], '$1')
						.replace(delimiter_patterns['+++'], '$1')
						.replace(delimiter_patterns[':::'], '$1'),
					rendered: [],
					can_copy: options.copy
				};

				codeblock.files.push(file);

				let cached = snippets.get(decodedText);

				if (!cached) {
					cached = [];

					const converted =
						token.lang === 'js' || token.lang === 'svelte'
							? await generate_ts_from_js(source, token.lang, options)
							: undefined;

					let highlighted = await syntax_highlight({
						filename,
						language: token.lang,
						prelude,
						source,
						check,
						references,
						twoslashRoot
					});

					cached.push(
						highlighted.replace('<pre', converted ? '<pre data-js' : '<pre data-js data-ts')
					);

					if (converted) {
						const language = token.lang === 'js' ? 'ts' : token.lang;

						if (language === 'ts') {
							prelude = prelude.replace(/(\/\/ @filename: .+)\.js$/gm, '$1.ts');
						}

						highlighted = await syntax_highlight({
							filename,
							language,
							prelude,
							source: converted,
							check,
							references,
							twoslashRoot
						});

						cached.push(highlighted.replace('<pre', '<pre data-ts'));
					}

					snippets.save(decodedText, cached);
				}

				file.rendered.push(...cached);
				codeblock.converted ||= cached.length > 1;
			}

			const tokens = 'tokens' in token ? token.tokens : undefined;

			if (tokens) {
				// ensure that `foo`/`bar` is transformed to `foo` / `bar`
				// https://github.com/sveltejs/svelte.dev/pull/577
				const slash_index =
					tokens.findIndex((token) => token.type === 'text' && token.text === '/') ?? -1;

				if (slash_index !== -1) {
					const before = tokens[slash_index - 1];
					const after = tokens[slash_index + 1];

					if (before?.type === 'codespan' && after?.type === 'codespan') {
						// @ts-expect-error
						tokens[slash_index].raw = tokens[slash_index].text = ' / ';
					}
				}

				// smart quotes
				for (let i = 0; i < tokens.length; i += 1) {
					const token = tokens[i];

					if (token.type === 'text') {
						token.text = smart_quotes(token.text, { first: i === 0 });
					}
				}
			}
		},
		html({ text }) {
			if (text.startsWith('<!-- codeblock:start')) {
				current_block = codeblocks.shift()!;

				const buttons: string[] = current_block.files.map((file) => {
					if (!file.name) {
						throw new Error('Files in a codeblock must have a name');
					}

					return `
						<button id="${file.tab_id}" aria-controls="${file.panel_id}" role="tab" aria-selected="${file.selected}" tabindex="${file.selected ? 0 : -1}">
							<span class="filename" data-ext="${file.ext}">${file.name}</span>
						</button>
					`;
				});

				return `
					<div class="code-block">
						<div class="controls">
							<div class="tabs" role="tablist" aria-label="Files">${buttons.join('')}</div>
							<div class="open-in-playground"><a href="/playground/untitled#${current_block.hash}">Open <span class="if-large">in playground</span></a></div>
							${current_block.converted ? `<input class="ts-toggle raised" checked title="Toggle language" type="checkbox" aria-label="Toggle JS/TS">` : ``}
							<button class="copy-to-clipboard raised" title="Copy to clipboard" aria-label="Copy to clipboard"></button>
						</div>`;
			} else if (text.trim() === '<!-- codeblock:end -->') {
				current_block = null;
				return '</div>';
			}

			return text;
		},
		heading({ tokens, depth }) {
			const text = this.parser!.parseInline(tokens);
			const html = text.replace(/<\/?code>/g, '');

			headings[depth - 1] = slugify(text);
			headings.length = depth;
			const slug = headings.filter(Boolean).join('-');

			return `<h${depth} id="${slug}"><span>${html}</span><a href="#${slug}" class="permalink" aria-label="permalink"></a></h${depth}>`;
		},
		code({ text }) {
			const decodedText = decode_html_entities(text);
			const symbols = extractImportedSymbols(decodedText);

			// const cached = snippets.get(decodedText);
			// if (!cached) throw new Error('huh?');

			// let html = injectReferenceLinks(cached, references, extractImportedSymbols(decodedText));

			const block = current_block ?? codeblocks.shift()!;
			const file = block.files.shift()!;

			let html = '';

			if (current_block) {
				// tabs
				html = `<div id="${file.panel_id}" aria-labelledby="${file.tab_id}" role="tabpanel" data-visible="${file.selected}">`;
			} else {
				// single file
				html = `<div class="code-block">`;

				const needs_controls = file.name !== null || file.can_copy || file.rendered.length > 1;

				if (needs_controls) {
					html += '<div class="controls">';

					if (file.name) {
						html += `<span class="filename" data-ext="${file.ext}">${file.name}</span>`;
					}

					if (file.rendered.length > 1) {
						html += `<input class="ts-toggle raised" checked title="Toggle language" type="checkbox" aria-label="Toggle JS/TS">`;
					}

					if (file.can_copy) {
						html += `<button class="copy-to-clipboard raised" title="Copy to clipboard" aria-label="Copy to clipboard"></button>`;
					}

					html += '</div>';
				}
			}

			for (const pre of file.rendered) {
				html += injectReferenceLinks(pre, references, symbols);
			}

			html += '</div>';

			return html;
		},
		blockquote(token) {
			let content = this.parser?.parse(token.tokens) ?? '';

			if (content.includes('[!LEGACY]')) {
				content = `<details class="legacy"><summary>Legacy mode</summary>${content.replace('[!LEGACY]', '')}</details>`;
			}

			if (content.includes('[!DETAILS]')) {
				const regex = /\[!DETAILS\] (.+)/;
				const match = regex.exec(content)!;
				content = `<details><summary>${match[1]}</summary>${content.replace(regex, '')}</details>`;
				return `<blockquote class="note">${content}</blockquote>`;
			}

			if (content.includes('[!NOTE]')) {
				return `<blockquote class="note">${content.replace('[!NOTE]', '')}</blockquote>`;
			}

			return `<blockquote>${content}</blockquote>`;
		}
	});

	return transformed;
}

/**
 * Pre-render step. Takes in all the code snippets, and replaces them with TS snippets if possible
 */
async function generate_ts_from_js(
	code: string,
	language: 'js' | 'svelte',
	options: SnippetOptions
) {
	// No named file -> assume that the code is not meant to be shown in two versions
	if (!options.file) return;

	// config files have no .ts equivalent
	if (options.file === 'svelte.config.js') return;

	if (language === 'svelte') {
		// Assumption: no module blocks
		const script = code.match(/<script>([\s\S]+?)<\/script>/);
		if (!script) return;

		const [outer, inner] = script;
		const ts = await convert_to_ts(inner, '\t', '\n');

		if (!ts) return;

		return code.replace(outer, `<script lang="ts">\n${ts}\n</script>`);
	}

	return await convert_to_ts(code);
}

function get_jsdoc(node: ts.Node) {
	const { jsDoc } = node as { jsDoc?: ts.JSDoc[] };
	return jsDoc;
}

/**
 * Transforms a JS code block into a TS code block by turning JSDoc into type annotations.
 * Due to pragmatism only the cases currently used in the docs are implemented.
 */
async function convert_to_ts(js_code: string, indent = '', offset = '') {
	js_code = js_code
		.replaceAll('// @filename: index.js', '// @filename: index.ts')
		.replace(/(\/\/\/ .+?\.)js/, '$1ts')
		// *\/ appears in some JsDoc comments in d.ts files due to the JSDoc-in-JSDoc problem
		.replace(/\*\\\//g, '*/');

	const ast = ts.createSourceFile(
		'filename.ts',
		js_code,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const code = new MagicString(js_code);
	const imports = new Map();

	async function walk(node: ts.Node, prev: ts.Node | null) {
		const jsdoc = get_jsdoc(node);

		if (jsdoc) {
			// this isn't an exhaustive list of tags we could potentially encounter (no `@template` etc)
			// but it's good enough to cover what's actually in the docs right now
			let type: string | null = null;
			let params: string[] = [];
			let returns: string | null = null;
			let satisfies: string | null = null;

			if (jsdoc.length > 1) {
				throw new Error('woah nelly');
			}

			const { comment, tags = [] } = jsdoc[0];

			for (const tag of tags) {
				if (ts.isJSDocTypeTag(tag)) {
					type = get_type_info(get_jsdoc_type_expression_text(tag.getText()));
				} else if (ts.isJSDocParameterTag(tag)) {
					params.push(get_type_info(tag.typeExpression?.getText()!));
				} else if (ts.isJSDocReturnTag(tag)) {
					returns = get_type_info(tag.typeExpression?.getText()!);
				} else if (ts.isJSDocSatisfiesTag(tag)) {
					satisfies = get_type_info(tag.typeExpression?.getText()!);
				} else {
					throw new Error('Unhandled tag');
				}

				let start = tag.getStart();
				let end = tag.getEnd();

				while (start > 0 && code.original[start] !== '\n') start -= 1;
				while (end > 0 && code.original[end] !== '\n') end -= 1;
				code.remove(start, end);
			}

			if (type && satisfies) {
				throw new Error('Cannot combine @type and @satisfies');
			}

			if (ts.isFunctionDeclaration(node)) {
				// convert function to a `const`
				if (type || satisfies) {
					const is_export = node.modifiers?.some(
						(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
					);

					const is_async = node.modifiers?.some(
						(modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword
					);

					code.overwrite(
						node.getStart(),
						node.name!.getStart(),
						is_export ? `export const ` : `const `
					);

					const modifier = is_async ? 'async ' : '';
					code.appendLeft(
						node.name!.getEnd(),
						type ? `: ${type} = ${modifier}` : ` = ${modifier}(`
					);

					code.prependRight(node.body!.getStart(), '=> ');

					code.appendLeft(node.getEnd(), satisfies ? `) satisfies ${satisfies};` : ';');
				}

				for (let i = 0; i < node.parameters.length; i += 1) {
					if (params[i] !== undefined) {
						code.appendLeft(node.parameters[i].getEnd(), `: ${params[i]}`);
					}
				}

				if (returns) {
					let start = node.body!.getStart();
					while (code.original[start - 1] !== ')') start -= 1;
					code.appendLeft(start, `: ${returns}`);
				}
			} else if (ts.isVariableStatement(node) && node.declarationList.declarations.length === 1) {
				if (params.length > 0 || returns) {
					throw new Error('TODO handle @params and @returns in variable declarations');
				}

				const declaration = node.declarationList.declarations[0];

				if (type) {
					code.appendLeft(declaration.name.getEnd(), `: ${type}`);
				}

				if (satisfies) {
					let end = declaration.getEnd();
					if (code.original[end - 1] === ';') end -= 1;
					code.appendLeft(end, ` satisfies ${satisfies}`);
				}
			} else if (
				(ts.isPropertyAssignment(node) && ts.isArrowFunction(node.initializer)) ||
				ts.isMethodDeclaration(node)
			) {
				if (type) {
					throw new Error('@type on property methods does nothing');
				}

				const parameters = ts.isMethodDeclaration(node)
					? node.parameters
					: (node.initializer as ts.ArrowFunction).parameters;
				for (let i = 0; i < parameters.length; i += 1) {
					if (params[i] !== undefined) {
						code.appendLeft(parameters[i].getEnd(), `: ${params[i]}`);
					}
				}

				if (returns) {
					const body = ts.isMethodDeclaration(node)
						? node.body
						: (node.initializer as ts.ArrowFunction).body;
					let start = body!.getStart();
					while (code.original[start - 1] !== ')') start -= 1;
					code.appendLeft(start, `: ${returns}`);
				}
			} else if (type && ts.isParenthesizedExpression(node)) {
				// convert `/* @type {Foo} */ (foo)` to `foo as Foo`
				// TODO one day we may need to account for operator precedence
				// (i.e. preserve the parens in e.g. `(x as y).z()`)
				let start = node.getStart();
				while (js_code[start - 1] !== '/') start -= 1;
				code.remove(start, node.getStart() + 1);

				let end = node.getEnd();
				code.overwrite(end - 1, end, ` as ${type}`);
			} else {
				throw new Error(
					'Unhandled @type JsDoc->TS conversion: ' + js_code.slice(node.getStart(), node.getEnd())
				);
			}

			if (!comment) {
				// remove the whole thing
				let start = jsdoc[0].getStart();
				let end = jsdoc[0].getEnd();

				while (start > 0 && code.original[start - 1] === '\t') start -= 1;
				while (start > 0 && code.original[start - 1] === '\n') start -= 1;

				let is_multiline = false;

				if (prev) {
					is_multiline =
						code.original.slice(prev.getStart(), prev.getEnd()).includes('\n') ||
						code.original.slice(node.getStart(), node.getEnd()).includes('\n');
				}

				code.overwrite(start, end, is_multiline ? '\n' : '');
			}
		}

		// the TypeScript API is such a hot mess, AFAICT there is no non-stupid way
		// to get the previous sibling within the visitor, so since we need it we
		// have to pass it in from the parent visitor
		let child_prev: ts.Node | null = null;

		for (const child_node of node.getChildren()) {
			await walk(child_node, child_prev);
			child_prev = child_node;
		}
	}

	await walk(ast, null);

	if (imports.size) {
		const import_statements = Array.from(imports.entries())
			.map(([from, names]) => {
				return `${indent}import type { ${Array.from(names).join(', ')} } from '${from}';`;
			})
			.join('\n');

		const last_import = [...ast.statements].findLast((statement) =>
			ts.isImportDeclaration(statement)
		);

		if (last_import) {
			code.appendLeft(last_import.getEnd(), '\n' + import_statements);
		} else {
			code.prependLeft(0, offset + import_statements + '\n');
		}
	}

	// remove leading/trailing newlines (not any whitespace, because that can signify diffs)
	let transformed = code.toString().replace(/^\n+/, '').replace(/\n+$/, '');

	return transformed === js_code ? undefined : transformed;

	function get_type_info(text: string) {
		const type = text
			.replace(/^\{|\}$/g, '') // remove surrounding `{` and `}`
			.replace(/ \* ?/gm, '')
			.replace(/import\('(.+?)'\)\.(\w+)(?:(<.+>))?/gms, (_, source, name, args = '') => {
				const existing = imports.get(source);
				if (existing) {
					existing.add(name);
				} else {
					imports.set(source, new Set([name]));
				}

				return name + args;
			});

		return type;
	}

	function get_jsdoc_type_expression_text(text: string): string {
		return text.replace(/^@type\s*/, '').trim();
	}
}

function find_nearest_node_modules(file: string): string | null {
	let current = file;

	while (current !== (current = path.dirname(current))) {
		const resolved = path.join(current, 'node_modules');
		if (fs.existsSync(resolved)) return resolved;
	}

	return null;
}

/**
 * Get the hash of a dependency graph,
 * excluding imports from `node_modules`
 */
function hash_graph(hash: Hash, file: string, seen = new Set<string>()) {
	if (seen.has(file)) return;
	seen.add(file);

	const content = fs.readFileSync(file, 'utf-8');

	for (const [_, source] of content.matchAll(/^import(?:.+?\s+from\s+)?['"](.+)['"];?$/gm)) {
		if (source[0] !== '.') continue;

		let resolved = path.resolve(file, '..', source);
		if (!fs.existsSync(resolved)) resolved += '.ts';
		if (!fs.existsSync(resolved))
			throw new Error(`Could not resolve ${source} relative to ${file}`);

		hash_graph(hash, resolved, seen);
	}

	hash.update(content);
}

function parse_options(source: string, language: string) {
	METADATA_REGEX.lastIndex = 0;

	const options: SnippetOptions = {
		file: null,
		link: false,
		copy: language !== '' && language !== 'dts'
	};

	source = source.replace(METADATA_REGEX, (_, key, value) => {
		switch (key) {
			case 'file':
				options.file = value;
				break;

			case 'link':
				options.link = value === 'true';

			case 'copy':
				options.copy = value === 'true';
				break;

			default:
				throw new Error(`Unrecognised option ${key}`);
		}

		return '';
	});

	return { source, options };
}

/**
 * `marked` replaces tabs with four spaces, which is unhelpful.
 * This function turns them back into tabs (plus leftover spaces for e.g. `\t * some JSDoc`)
 */
function adjust_tab_indentation(source: string, language: string) {
	return source.replace(/^((?:    )+)/gm, (match, spaces) => {
		if (language === 'yaml') return match;

		return '\t'.repeat(spaces.length / 4) + ' '.repeat(spaces.length % 4);
	});
}

function get_leading_frontmatter_delimiters(source: string, language: string) {
	const delimiters = new Set<number>();

	if (!/^(markdown|md|yaml|yml)$/.test(language)) {
		return delimiters;
	}

	const opening = /^---(?=[ \t]*(?:\r?\n|$))/.exec(source);

	if (!opening) {
		return delimiters;
	}

	const closing = /^---(?=[ \t]*(?:\r?$))/m.exec(source.slice(opening[0].length));

	if (!closing) {
		return delimiters;
	}

	delimiters.add(opening.index);
	delimiters.add(opening[0].length + closing.index);

	return delimiters;
}

const delimiter_substitutes = {
	'---': '                                           ',
	'+++': '                                         ',
	':::': '                                       '
};

const delimiter_patterns = Object.fromEntries(
	Object.entries(delimiter_substitutes).map(([key, substitute]) => [
		key,
		new RegExp(`${substitute}([^ ]|[^ ][^]+?[^ ])${substitute}`, 'g')
	])
);

function highlight_all_spans(html: string, pattern: RegExp, classname: string) {
	const open = `<span class="${classname}">`;

	return html.replace(pattern, (_, content, index) => {
		let a = content.indexOf('<span');
		let b = content.indexOf('</span');
		let c = content.lastIndexOf('<span');
		let d = content.lastIndexOf('</span');

		let adjusted: string = content;

		if (b !== -1 && (a === -1 || b < a)) {
			// starts inside a <span>
			const tag_start = html.lastIndexOf('<span', index);
			const tag = html.slice(tag_start, html.indexOf('>', tag_start) + 1);
			adjusted = `</span>${open}${tag}${adjusted}`;
		} else {
			adjusted = `${open}${adjusted}`;
		}

		if (c !== -1 && (d === -1 || c > d)) {
			// ends inside a <span>
			const tag = content.slice(c, content.indexOf('>', c) + 1);
			adjusted = `${adjusted}</span></span>${tag}`;
		} else {
			adjusted = `${adjusted}</span>`;
		}

		return adjusted.replace(/\n/g, `</span>\n${open}`);
	});
}

async function syntax_highlight({
	prelude,
	source,
	filename,
	language,
	check,
	references,
	twoslashRoot
}: {
	prelude: string;
	source: string;
	filename: string;
	language: string;
	check: boolean;
	references?: Record<string, string>;
	twoslashRoot?: string;
}) {
	let html = '';

	if (language === 'js' || language === 'ts') {
		/** We need to stash code wrapped in `---` highlights, because otherwise TS will error on e.g. bad syntax or duplicate declarations. */
		const redactions: Array<{ content: string; placeholder: string }> = [];
		const substitute = delimiter_substitutes['---'];
		const pattern = new RegExp(`${substitute}([^ ]|[^ ][^]+?[^ ])${substitute}`, 'g');
		const redacted = source.replace(pattern, (_, content) => {
			const placeholder = '\f'.repeat(content.length);
			redactions.push({ content, placeholder });
			return placeholder;
		});

		try {
			html = check
				? get_twoslash_highlighter(language, twoslashRoot)(prelude + redacted)
				: highlight_source(redacted, language);

			for (const { content, placeholder } of redactions) {
				html = html.replace(
					placeholder,
					`<span class="highlight remove">${escape_html(content)}</span>`
				);
			}

			if (check) {
				html = html.replace(/<span class="twoslash-error-line"[^>]*>[^]*?<\/span>/g, '');
				html = injectReferenceLinks(html, references, extractImportedSymbols(source));
			}
		} catch (e) {
			console.error((e as Error).message);
			console.warn(prelude + redacted);
			throw new Error(`Error compiling snippet in ${filename}`);
		}
	} else {
		html = highlight_source(source, language);
	}

	// Normalize Twinkleplop output for the existing code-block annotations.
	html = html
		// put whitespace outside `<span>` elements, so that
		// highlight delimiters fall outside tokens
		.replace(/(<span[^>]+?>)(\s+)/g, '$2$1')
		.replace(/(\s+)(<\/span>)/g, '$2$1')

		// remove tabindex
		.replace(' tabindex="0"', '');

	html = highlight_all_spans(html, delimiter_patterns['---'], 'highlight remove');
	html = highlight_all_spans(html, delimiter_patterns['+++'], 'highlight add');
	html = highlight_all_spans(html, delimiter_patterns[':::'], 'highlight');

	return indent_multiline_comments(html)
		.replace(/\/\*…\*\//g, '…')
		.replace('<pre', `<pre data-language="${language}"`);
}

function indent_multiline_comments(str: string) {
	return str.replace(
		/^(\s+)<span class="(?:tok )?comment">([\s\S]+?)<\/span>\n/gm,
		(_, intro_whitespace, content) => {
			// we use some CSS trickery to make comments break onto multiple lines while preserving indentation
			const lines = (intro_whitespace + content + '').split('\n');
			return lines
				.map((line) => {
					const match = /^(\s*)(.*)/.exec(line);
					const indent = (match?.[1] ?? '').replace(/\t/g, '  ').length;

					return `<span class="comment wrapped" style="--indent: ${indent}ch">${line ?? ''}</span>`;
				})
				.join('');
		}
	);
}
