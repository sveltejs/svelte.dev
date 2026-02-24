import MagicString from 'magic-string';
import { createHash, type Hash } from 'node:crypto';
import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import ts from 'typescript';
import * as marked from 'marked';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import { createCssVariablesTheme } from 'shiki';
import { transformerTwoslash, rendererRich } from '@shikijs/twoslash';
import { decode_html_entities, SHIKI_LANGUAGE_MAP, slugify, smart_quotes, transform } from './utils.ts';

interface SnippetOptions {
	file: string | null;
	link: boolean;
	copy: boolean;
}

type TwoslashBanner = (filename: string, content: string) => string;

// Supports js, svelte, yaml files
const METADATA_REGEX =
	/(?:<!---\s*|\/\/\/\s*|###\s*)(?<key>file|link|copy):\s*(?<value>.*?)(?:\s*--->|$)\n/gm;

const theme = createCssVariablesTheme({
	name: 'css-variables',
	variablePrefix: '--shiki-'
});

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

const highlighter = await createHighlighterCore({
	themes: [],
	langs: [
		import('@shikijs/langs/javascript'),
		import('@shikijs/langs/typescript'),
		import('@shikijs/langs/html'),
		import('@shikijs/langs/css'),
		import('@shikijs/langs/bash'),
		import('@shikijs/langs/yaml'),
		import('@shikijs/langs/svelte')
	],
	engine: createOnigurumaEngine(import('shiki/wasm'))
});

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
	const cache = new Map();
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

		return `${current}/${digest}.html`;
	}

	return {
		get(source: string) {
			let snippet = cache.get(source);

			if (snippet === undefined) {
				const file = get_file(source);

				if (fs.existsSync(file)) {
					snippet = fs.readFileSync(file, 'utf-8');
					cache.set(source, snippet);
				}
			}

			return snippet;
		},
		save(source: string, html: string) {
			cache.set(source, html);

			try {
				fs.mkdirSync(directory);
			} catch {}

			fs.writeFileSync(get_file(source), html);
		}
	};
}

const snippets = await create_snippet_cache();

/**
 * A super markdown renderer function. Renders svelte and kit docs specific specific markdown code to html.
 *
 * - Syntax Highlighting -> shikiJS with `css-variables` theme.
 * - TS hover snippets -> shiki-twoslash. JS and TS code snippets(other than d.ts) are run through twoslash.
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

/**
 * Injects reference links into twoslash popup tooltips.
 * Uses rendererRich structure: <span class="twoslash-hover"><span class="twoslash-popup-container">...</span>symbol</span>
 * Only adds links for symbols that were actually imported in the code snippet.
 */
function injectReferenceLinks(
	html: string,
	references?: Record<string, string>,
	importedSymbols?: Set<string>
): string {
	if (!references || !importedSymbols || html.includes('twoslash-popup-reference')) {
		return html;
	}

	const insertions: Array<{ index: number; div: string }> = [];

	for (const match of html.matchAll(/<span class="twoslash-popup-container">/g)) {
		const startIdx = match.index! + match[0].length;
		let depth = 1;
		let pos = startIdx;
		let endIdx = -1;

		// Track nested span depth to find the matching closing </span>
		while (depth > 0 && pos < html.length) {
			const openIdx = html.indexOf('<span', pos);
			const closeIdx = html.indexOf('</span>', pos);
			if (closeIdx === -1) break;

			if (openIdx !== -1 && openIdx < closeIdx) {
				depth++;
				pos = openIdx + '<span'.length;
			} else {
				depth--;
				if (depth === 0) endIdx = closeIdx;
				pos = closeIdx + '</span>'.length;
			}
		}

		if (endIdx === -1) continue;

		// Symbol name appears after popup container closes, before twoslash-hover closes
		const afterPopup = html.substring(endIdx + '</span>'.length, endIdx + '</span>'.length + 100);
		const symbolMatch = afterPopup.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)</);
		if (!symbolMatch) continue;

		const symbolName = symbolMatch[1];
		if (!importedSymbols.has(symbolName)) continue;

		const url = references[symbolName];
		if (url) {
			insertions.push({
				index: endIdx,
				div: `<div class="twoslash-popup-reference"><a href="${url}">reference</a></div>`
			});
		}
	}

	// Insert in reverse order to maintain correct string indices
	for (let i = insertions.length - 1; i >= 0; i--) {
		const { index, div } = insertions[i];
		html = html.slice(0, index) + div + html.slice(index);
	}

	return html;
}

export async function render_content_markdown(
	filename: string,
	body: string,
	options?: { check?: boolean; references?: Record<string, string> },
	twoslashBanner?: TwoslashBanner
) {
	const headings: string[] = [];
	const { check = true, references } = options ?? {};

	return await transform(body, {
		async walkTokens(token) {
			if (token.type === 'code') {
				const decodedText = decode_html_entities(token.text);

				if (snippets.get(decodedText)) return;

				if (token.lang === 'diff') {
					throw new Error('Use +++ and --- annotations instead of diff blocks');
				}

				let { source, options } = parse_options(decodedText, token.lang);
				source = adjust_tab_indentation(source, token.lang);

				let prelude = '';

				if ((token.lang === 'js' || token.lang === 'ts') && check) {
					const match = /((?:[\s\S]+)\/\/ ---cut---\n)?([\s\S]+)/.exec(source)!;
					[, prelude = '// ---cut---\n', source] = match;

					const banner = twoslashBanner?.(filename, source);
					if (banner) prelude = '// @filename: injected.d.ts\n' + banner + '\n' + prelude;
				}

				source = source.replace(
					/(\+\+\+|---|:::)/g,
					(_, delimiter: keyof typeof delimiter_substitutes) => {
						return delimiter_substitutes[delimiter];
					}
				);

				const converted =
					token.lang === 'js' || token.lang === 'svelte'
						? await generate_ts_from_js(source, token.lang, options)
						: undefined;

				let html = '<div class="code-block">';

				const needs_controls = options.link || options.copy || converted;

				if (needs_controls) {
					html += '<div class="controls">';
				}

				if (options.file) {
					const ext = options.file.slice(options.file.lastIndexOf('.'));
					if (!ext) throw new Error(`Missing file extension: ${options.file}`);

					html += `<span class="filename" data-ext="${ext}">${options.file.slice(0, -ext.length)}</span>`;
				}

				if (converted) {
					html += `<input class="ts-toggle raised" checked title="Toggle language" type="checkbox" aria-label="Toggle JS/TS">`;
				}

				if (options.copy) {
					html += `<button class="copy-to-clipboard raised" title="Copy to clipboard" aria-label="Copy to clipboard"></button>`;
				}

				if (needs_controls) {
					html += '</div>';
				}

				html += await syntax_highlight({
					filename,
					language: token.lang,
					prelude,
					source,
					check,
					references
				});

				if (converted) {
					const language = token.lang === 'js' ? 'ts' : token.lang;

					if (language === 'ts') {
						prelude = prelude.replace(/(\/\/ @filename: .+)\.js$/gm, '$1.ts');
					}

					html += await syntax_highlight({
						filename,
						language,
						prelude,
						source: converted,
						check,
						references
					});
				}

				html += '</div>';

				// Save everything locally now
				snippets.save(decodedText, html);
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
						token.text = smart_quotes(token.text, { first: i === 0, html: true });
					}
				}
			}
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
			const cached = snippets.get(decodedText);
			if (cached) {
				return injectReferenceLinks(cached, references, extractImportedSymbols(decodedText));
			}
			return cached;
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

function replace_blank_lines(html: string) {
	// preserve blank lines in output (maybe there's a more correct way to do this?)
	return html.replaceAll(/<div class='line'>(&nbsp;)?<\/div>/g, '<div class="line">\n</div>');
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
	references
}: {
	prelude: string;
	source: string;
	filename: string;
	language: string;
	check: boolean;
	references?: Record<string, string>;
}) {
	let html = '';

	if (/^(dts|yaml|yml)/.test(language)) {
		html = replace_blank_lines(
			highlighter.codeToHtml(source, {
				lang: language === 'dts' ? 'ts' : language,
				theme
			})
		);
	} else if (language === 'js' || language === 'ts') {
		/** We need to stash code wrapped in `---` highlights, because otherwise TS will error on e.g. bad syntax, duplicate declarations */
		const redactions: string[] = [];

		const sub = delimiter_substitutes['---'];
		const pattern = new RegExp(`${sub}(?:[^ ]|[^ ][^]+?[^ ])${sub}`, 'g');

		const redacted = source.replace(pattern, (_, content) => {
			redactions.push(content);
			return ' '.repeat(content.length);
		});

		try {
			html = highlighter.codeToHtml(prelude + redacted, {
				lang: language,
				theme,
				transformers: check
					? [
							transformerTwoslash({
								renderer: rendererRich(),
								twoslashOptions: {
									compilerOptions: {
										allowJs: true,
										checkJs: true,
										types: ['svelte', '@sveltejs/kit', 'sv']
									}
								},
								// by default, twoslash does not run on .js files, change that through this option
								filter: () => true
							})
						]
					: []
			});

			html = html.replace(
				new RegExp(` {${delimiter_substitutes['---'].length + 1},}`, 'g'),
				() => redactions.shift()!
			);

			if (check) {
				// munge the twoslash output so that it renders sensibly. the order of operations
				// here is important — we need to work backwards, to avoid corrupting the offsets

				// first, strip out unwanted error lines
				html = html.replace(
					/<div class="twoslash-meta-line twoslash-error-line">[^]+?<\/div>/g,
					'\n'
				);

				const replacements: Array<{ start: number; end: number; content: string }> = [];

				for (const match of html.matchAll(/<div class="twoslash-popup-docs">([^]+?)<\/div>/g)) {
					// decode HTML entities that shiki uses to escape the JSDoc content
					const decoded = match[1]
						.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
						.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
						.replace(/&lt;/g, '<')
						.replace(/&gt;/g, '>')
						.replace(/&amp;/g, '&');
					const content = await render_content_markdown('<twoslash>', decoded, { check: false });

					replacements.push({
						start: match.index,
						end: match.index + match[0].length,
						content: '<div class="twoslash-popup-docs">' + content + '</div>'
					});
				}

				while (replacements.length > 0) {
					const { start, end, content } = replacements.pop()!;
					html = html.slice(0, start) + content + html.slice(end);
				}

				for (const match of html.matchAll(
					/<span class="twoslash-popup-docs-tag"><span class="twoslash-popup-docs-tag-name">([^]+?)<\/span><span class="twoslash-popup-docs-tag-value">([^]+?)<\/span><\/span>/g
				)) {
					const tag = match[1];
					let value = match[2];

					let content = `<span class="tag">${tag}</span><span class="value">`;

					if (tag === '@param' || tag === '@throws') {
						const words = value.split(' ');
						let param = words.shift()!;
						value = words.join(' ');

						if (tag === '@throws') {
							if (param[0] !== '{' || param[param.length - 1] !== '}') {
								throw new Error('TODO robustify @throws handling');
							}

							param = param.slice(1, -1);
						}

						content += `<span class="param">${param}</span> `;
					}

					content += marked.parseInline(value);
					content += '</span>';

					replacements.push({
						start: match.index,
						end: match.index + match[0].length,
						content: '<div class="tags">' + content + '</div>'
					});
				}

				while (replacements.length > 0) {
					const { start, end, content } = replacements.pop()!;
					html = html.slice(0, start) + content + html.slice(end);
				}

				html = injectReferenceLinks(html, references, extractImportedSymbols(source));
			}
		} catch (e) {
			console.error((e as Error).message);
			console.warn(prelude + redacted);
			throw new Error(`Error compiling snippet in ${filename}`);
		}

		html = replace_blank_lines(html);
	} else {
		const highlighted = highlighter.codeToHtml(source, {
			lang: SHIKI_LANGUAGE_MAP[language as keyof typeof SHIKI_LANGUAGE_MAP],
			theme
		});

		html = replace_blank_lines(highlighted);
	}

	// munge shiki output
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
		/^(\s+)<span class="token comment">([\s\S]+?)<\/span>\n/gm,
		(_, intro_whitespace, content) => {
			// we use some CSS trickery to make comments break onto multiple lines while preserving indentation
			const lines = (intro_whitespace + content + '').split('\n');
			return lines
				.map((line) => {
					const match = /^(\s*)(.*)/.exec(line);
					const indent = (match?.[1] ?? '').replace(/\t/g, '  ').length;

					return `<span class="token comment wrapped" style="--indent: ${indent}ch">${
						line ?? ''
					}</span>`;
				})
				.join('');
		}
	);
}
