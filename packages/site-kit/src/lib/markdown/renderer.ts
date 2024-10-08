import MagicString from 'magic-string';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import * as prettier from 'prettier';
import { codeToHtml, createCssVariablesTheme } from 'shiki';
import { transformerTwoslash } from '@shikijs/twoslash';
import { SHIKI_LANGUAGE_MAP, escape, normalizeSlugify, smart_quotes, transform } from './utils';
import type { Declaration, TypeElement, Modules } from './index';

interface SnippetOptions {
	file: string | null;
	link: boolean;
	copy: boolean;
}

type TwoslashBanner = (
	filename: string,
	content: string,
	language: string,
	options: SnippetOptions
) => string;

interface RenderContentOptions {
	twoslashBanner?: TwoslashBanner;
	modules?: Modules;
	cacheCodeSnippets?: boolean;
	resolveTypeLinks?: Parameters<typeof create_type_links>['1'];
}

// Supports js, svelte, yaml files
const METADATA_REGEX =
	/(?:<!---\s*|\/\/\/\s*|###\s*)(?<key>file|link|copy):\s*(?<value>.*?)(?:\s*--->|$)\n/gm;

const theme = createCssVariablesTheme({
	name: 'css-variables',
	variablePrefix: '--shiki-',
	variableDefaults: {},
	fontStyle: true
});

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
 * @param {import('.').Modules} [options.modules] Module info generated from type-gen script. Used to create type links and type information blocks
 * @param {boolean} [options.cacheCodeSnippets] Whether to cache code snippets or not. Defaults to true.
 * @param {Parameters<typeof create_type_links>['1']} [options.resolveTypeLinks] Resolve types into its slugs(used on the page itself).
 */
export async function render_content_markdown(
	filename: string,
	body: string,
	{
		twoslashBanner,
		modules = [],
		cacheCodeSnippets = false,
		resolveTypeLinks
	}: RenderContentOptions = {}
) {
	const { type_links, type_regex } = create_type_links(modules, resolveTypeLinks);
	const snippets = await create_snippet_cache(cacheCodeSnippets);

	body = await replace_export_type_placeholders(body, modules);

	const headings: string[] = [];

	// this is a bit hacky, but it allows us to prevent type declarations
	// from linking to themselves
	let current = '';

	return await transform(body, {
		async walkTokens(token) {
			if (token.type === 'heading') {
				current = token.text;
			}

			if (token.type === 'code') {
				if (snippets.get(token.text)) return;

				let { source, options } = parse_options(token.text, token.lang);
				source = adjust_tab_indentation(source, token.lang);

				const converted =
					token.lang === 'js' || token.lang === 'svelte'
						? await generate_ts_from_js(source, token.lang, options)
						: undefined;

				let html = '<div class="code-block"><div class="controls">';

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

				html += '</div>';

				html += await syntax_highlight({
					filename,
					language: token.lang,
					source,
					twoslashBanner,
					options
				});

				if (converted) {
					html += await syntax_highlight({
						filename,
						language: token.lang === 'js' ? 'ts' : token.lang,
						source: converted,
						twoslashBanner,
						options
					});
				}

				html += '</div>';

				// TODO this is currently disabled, we don't have access to `modules`
				if (type_regex) {
					type_regex.lastIndex = 0;

					html = html.replace(type_regex, (match, prefix, name, pos, str) => {
						const char_after = str.slice(pos + match.length, pos + match.length + 1);

						if (!options.link || name === current || /(\$|\d|\w)/.test(char_after)) {
							// we don't want e.g. RequestHandler to link to RequestHandler
							return match;
						}

						const link = type_links?.get(name)
							? `<a href="${type_links.get(name)?.relativeURL}">${name}</a>`
							: '';
						return `${prefix || ''}${link}`;
					});
				}

				// Save everything locally now
				snippets.save(token.text, html);
			}
		},
		text(token) {
			// @ts-expect-error I think this is a bug in marked — some text tokens have children,
			// but that's not reflected in the types. In these cases we can't just use `token.tokens`
			// because that will result in e.g. `<code>` elements not being generated
			if (token.tokens) {
				// @ts-expect-error
				return this.parser!.parseInline(token.tokens);
			}

			return smart_quotes(token.text, true);
		},
		heading({ tokens, depth, raw }) {
			const text = this.parser!.parseInline(tokens);

			headings[depth - 1] = normalizeSlugify(raw);
			headings.length = depth;
			const slug = headings.filter(Boolean).join('-');
			return `<h${depth} id="${slug}">${text.replace(
				/<\/?code>/g,
				''
			)}<a href="#${slug}" class="permalink"><span class="visually-hidden">permalink</span></a></h${depth}>`;
		},
		code({ text }) {
			return snippets.get(text);
		},
		codespan({ text }) {
			return (
				'<code>' +
				(type_regex
					? text.replace(type_regex, (_, prefix, name) => {
							const link = type_links?.get(name)
								? `<a href="${type_links.get(name)?.relativeURL}">${name}</a>`
								: '';
							return `${prefix || ''}${link}`;
						})
					: text) +
				'</code>'
			);
		},
		blockquote(token) {
			let content = this.parser?.parse(token.tokens) ?? '';
			if (content.includes('[!LEGACY]')) {
				content = `<details class="legacy"><summary><label>Legacy mode <button class="raised"></button></label></summary>${content.replace('[!LEGACY]', '')}</details>`;
			}
			return `<blockquote>${content}</blockquote>`;
		}
	});
}

/**
 * Pre-render step. Takes in all the code snippets, and replaces them with TS snippets if possible
 * May replace the language labels (```js) to custom labels(```generated-ts, ```original-js, ```generated-svelte,```original-svelte)
 */
async function generate_ts_from_js(
	code: string,
	language: 'js' | 'svelte',
	options: SnippetOptions
) {
	// No named file -> assume that the code is not meant to be shown in two versions
	if (!options.file) return;

	if (language === 'js') {
		// config files have no .ts equivalent
		if (options.file === 'svelte.config.js') return;

		return await convert_to_ts(code.replace(/\/\/\/ file: .+?\n/, ''));
	}

	// Assumption: no module blocks
	const script = code.match(/<script>([\s\S]+?)<\/script>/);
	if (!script) return;

	const [outer, inner] = script;
	const ts = await convert_to_ts(inner, '\t', '\n');

	if (!ts) return;

	return code.replace(outer, `<script lang="ts">\n\t${ts.trim()}\n</script>`);
}

function get_jsdoc(node: ts.Node) {
	const { jsDoc } = node as { jsDoc?: ts.JSDoc[] };
	return jsDoc;
}

/**
 * Transforms a JS code block into a TS code block by turning JSDoc into type annotations.
 * Due to pragmatism only the cases currently used in the docs are implemented.
 */
export async function convert_to_ts(js_code: string, indent = '', offset = '') {
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

	async function walk(node: ts.Node) {
		const jsdoc = get_jsdoc(node);
		if (jsdoc) {
			for (const comment of jsdoc) {
				let modified = false;

				let count = 0;
				for (const tag of comment.tags ?? []) {
					if (ts.isJSDocTypeTag(tag)) {
						const [name, generics] = await get_type_info(tag);

						if (ts.isFunctionDeclaration(node)) {
							const is_export = node.modifiers?.some(
								(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
							)
								? 'export '
								: '';
							const is_async = node.modifiers?.some(
								(modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword
							);

							const type = generics !== undefined ? `${name}<${generics}>` : name;

							if (node.name && node.body) {
								code.overwrite(
									node.getStart(),
									node.name.getEnd(),
									`${is_export ? 'export ' : ''}const ${node.name.getText()}: ${type} = (${
										is_async ? 'async ' : ''
									}`
								);

								code.appendLeft(node.body.getStart(), '=> ');
								code.appendLeft(node.body.getEnd(), ')');

								modified = true;
							}
						} else if (
							ts.isVariableStatement(node) &&
							node.declarationList.declarations.length === 1
						) {
							const variable_statement = node.declarationList.declarations[0];

							if (variable_statement.name.getText() === 'actions') {
								code.appendLeft(variable_statement.getEnd(), ` satisfies ${name}`);
							} else {
								code.appendLeft(
									variable_statement.name.getEnd(),
									`: ${name}${generics ? `<${generics}>` : ''}`
								);
							}

							modified = true;
						} else {
							throw new Error('Unhandled @type JsDoc->TS conversion: ' + js_code);
						}
					} else if (ts.isJSDocParameterTag(tag) && ts.isFunctionDeclaration(node)) {
						const sanitised_param = tag
							.getFullText()
							.replace(/\s+/g, '')
							.replace(/(^\*|\*$)/g, '');

						const [, param_type] = /@param{(.+)}(.+)/.exec(sanitised_param) ?? [];

						let param_count = 0;
						for (const param of node.parameters) {
							if (count !== param_count) {
								param_count++;
								continue;
							}

							code.appendLeft(param.getEnd(), `:${param_type}`);

							param_count++;
						}

						modified = true;
					}

					count++;
				}

				if (modified) {
					code.overwrite(comment.getStart(), comment.getEnd(), '');
				}
			}
		}

		for (const child_node of node.getChildren()) {
			await walk(child_node);
		}
	}

	await walk(ast);

	if (imports.size) {
		const import_statements = Array.from(imports.entries())
			.map(([from, names]) => {
				return `${indent}import type { ${Array.from(names).join(', ')} } from '${from}';`;
			})
			.join('\n');
		const idxOfLastImport = [...ast.statements]
			.reverse()
			.find((statement) => ts.isImportDeclaration(statement))
			?.getEnd();
		const insertion_point = Math.max(
			idxOfLastImport ? idxOfLastImport + 1 : 0,
			js_code.includes('---cut---')
				? js_code.indexOf('\n', js_code.indexOf('---cut---')) + 1
				: js_code.includes('/// file:')
					? js_code.indexOf('\n', js_code.indexOf('/// file:')) + 1
					: 0
		);
		code.appendLeft(insertion_point, offset + import_statements + '\n');
	}

	let transformed = await prettier.format(code.toString(), {
		printWidth: 100,
		parser: 'typescript',
		useTabs: true,
		singleQuote: true,
		trailingComma: 'none'
	});

	// Indent transformed's each line by 2
	transformed = transformed
		.replace(/\n$/, '')
		.split('\n')
		.map((line) => indent + line)
		.join('\n');

	return transformed === js_code ? undefined : transformed.replace(/\n\s*\n\s*\n/g, '\n\n');

	async function get_type_info(tag: ts.JSDocTypeTag | ts.JSDocParameterTag) {
		const type_text = tag.typeExpression?.getText();
		let name = type_text?.slice(1, -1); // remove { }

		const single_line_name = (
			await prettier.format(name ?? '', {
				printWidth: 1000,
				parser: 'typescript',
				semi: false,
				singleQuote: true
			})
		).replace('\n', '');

		const import_match = /import\('(.+?)'\)\.(\w+)(?:<(.+)>)?$/s.exec(single_line_name);

		if (import_match) {
			const [, from, _name, generics] = import_match;
			name = _name;
			const existing = imports.get(from);
			if (existing) {
				existing.add(name);
			} else {
				imports.set(from, new Set([name]));
			}
			if (generics !== undefined) {
				return [
					name,
					generics
						.replaceAll('*', '') // get rid of JSDoc asterisks
						.replace('  }>', '}>') // unindent closing brace
				];
			}
		}
		return [name];
	}
}

/**
 * Replace module/export information placeholders in the docs.
 */
export async function replace_export_type_placeholders(content: string, modules: Modules) {
	const REGEXES = {
		/** Render a specific type from a module with more details. Example: `> EXPANDED_TYPES: svelte#compile` */
		EXPANDED_TYPES: /> EXPANDED_TYPES: (.+?)#(.+)$/gm,
		/** Render types from a specific module. Example: `> TYPES: svelte` */
		TYPES: /> TYPES: (.+?)(?:#(.+))?$/gm,
		/** Render all exports and types from a specific module. Example: `> MODULE: svelte` */
		MODULE: /> MODULE: (.+?)$/gm,
		/** Render the snippet of a specific export. Example: `> EXPORT_SNIPPET: svelte#compile` */
		EXPORT_SNIPPET: /> EXPORT_SNIPPET: (.+?)#(.+)?$/gm,
		/** Render all modules. Example: `> MODULES` */
		MODULES: /> MODULES/g, //! /g is VERY IMPORTANT, OR WILL CAUSE INFINITE LOOP
		/** Render all value exports from a specific module. Example: `> EXPORTS: svelte` */
		EXPORTS: /> EXPORTS: (.+)/
	};

	if (REGEXES.EXPORTS.test(content)) {
		throw new Error('yes');
	}

	if (!modules || modules.length === 0) {
		return content
			.replace(REGEXES.EXPANDED_TYPES, '')
			.replace(REGEXES.TYPES, '')
			.replace(REGEXES.EXPORT_SNIPPET, '')
			.replace(REGEXES.MODULES, '')
			.replace(REGEXES.EXPORTS, '');
	}
	content = await async_replace(content, REGEXES.EXPANDED_TYPES, async ([_, name, id]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name}`);
		if (!module.types) return '';

		const type = module.types.find((t) => t.name === id);

		if (!type) throw new Error(`Could not find type ${name}#${id}`);

		return stringify_expanded_type(type);
	});

	content = await async_replace(content, REGEXES.TYPES, async ([_, name, id]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name}`);
		if (!module.types) return '';

		if (id) {
			const type = module.types.find((t) => t.name === id);

			if (!type) throw new Error(`Could not find type ${name}#${id}`);

			return render_declaration(type, true);
		}

		let comment = '';
		if (module.comment) {
			comment += `${module.comment}\n\n`;
		}

		return (
			comment + module.types.map((t) => `## ${t.name}\n\n${render_declaration(t, true)}`).join('')
		);
	});

	content = await async_replace(content, REGEXES.EXPORT_SNIPPET, async ([_, name, id]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name} for EXPORT_SNIPPET clause`);

		if (!id) {
			throw new Error(`id is required for module ${name}`);
		}

		const exported = module.exports?.filter((t) => t.name === id);

		return exported?.map((d) => render_declaration(d, false)).join('\n\n') ?? '';
	});

	content = await async_replace(content, REGEXES.MODULE, async ([_, name]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name}`);

		return stringify_module(module);
	});

	content = await async_replace(content, REGEXES.MODULES, async () => {
		return modules
			.map((module) => {
				if (!module.exports) return;

				if (module.exports.length === 0 && !module.exempt) return '';

				let import_block = '';

				if (module.exports.length > 0) {
					// deduplication is necessary for now, because of `error()` overload
					const exports = Array.from(new Set(module.exports?.map((x) => x.name)));

					let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
					if (declaration.length > 80) {
						declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
					}

					import_block = fence(declaration, 'js');
				}

				return `## ${module.name}\n\n${import_block}\n\n${module.comment}\n\n${module.exports
					.map((declaration) => {
						const markdown = render_declaration(declaration, true);
						return `### ${declaration.name}\n\n${markdown}`;
					})
					.join('\n\n')}`;
			})
			.join('\n\n');
	});

	content = await async_replace(content, REGEXES.EXPORTS, async ([_, name]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name} for EXPORTS: clause`);
		if (!module.exports) return '';

		if (module.exports.length === 0 && !module.exempt) return '';

		let import_block = '';

		if (module.exports.length > 0) {
			// deduplication is necessary for now, because of `error()` overload
			const exports = Array.from(new Set(module.exports.map((x) => x.name)));

			let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
			if (declaration.length > 80) {
				declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
			}

			import_block = fence(declaration, 'js');
		}

		return `${import_block}\n\n${module.comment}\n\n${module.exports
			.map((declaration) => {
				const markdown = render_declaration(declaration, true);
				return `### ${declaration.name}\n\n${markdown}`;
			})
			.join('\n\n')}`;
	});

	return content;
}

function render_declaration(declaration: Declaration, full: boolean) {
	let content = '';

	if (declaration.deprecated) {
		content += `<blockquote class="tag deprecated">\n\n${declaration.deprecated}\n\n</blockquote>\n\n`;
	}

	if (declaration.comment) {
		content += declaration.comment + '\n\n';
	}

	return (
		content +
		declaration.overloads
			.map((overload) => {
				const children = full
					? overload.children?.map((val) => stringify(val, 'dts')).join('\n\n')
					: '';

				return `<div class="ts-block">${fence(overload.snippet, 'dts')}${children}</div>\n\n`;
			})
			.join('')
	);
}

/**
 * Takes a module and returns a markdown string.
 */
function stringify_module(module: Modules[0]) {
	let content = '';

	if (module.exports && module.exports.length > 0) {
		// deduplication is necessary for now, because of method overloads
		const exports = Array.from(new Set(module.exports?.map((x) => x.name)));

		let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
		if (declaration.length > 80) {
			declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
		}

		content += fence(declaration, 'js');
	}

	if (module.comment) {
		content += `${module.comment}\n\n`;
	}

	for (const declaration of module.exports || []) {
		const markdown = render_declaration(declaration, true);
		content += `## ${declaration.name}\n\n${markdown}\n\n`;
	}

	for (const t of module.types || []) {
		content += `## ${t.name}\n\n` + render_declaration(t, true);
	}

	return content;
}

function stringify_expanded_type(type: Declaration) {
	return (
		type.comment +
		type.overloads
			.map((overload) =>
				overload.children
					?.map((child) => {
						let section = `## ${child.name}`;

						if (child.bullets) {
							section += `\n\n<div class="ts-block-property-bullets">\n\n${child.bullets.join(
								'\n'
							)}\n\n</div>`;
						}

						section += `\n\n${child.comment}`;

						if (child.children) {
							section += `\n\n<div class="ts-block-property-children">\n\n${child.children
								.map((v) => stringify(v))
								.join('\n')}\n\n</div>`;
						}

						return section;
					})
					.join('\n\n')
			)
			.join('\n\n')
	);
}

function fence(code: string, lang: keyof typeof SHIKI_LANGUAGE_MAP = 'ts') {
	return (
		'\n\n```' +
		lang +
		'\n' +
		(['js', 'ts'].includes(lang) ? '// @noErrors\n' : '') +
		code +
		'\n```\n\n'
	);
}

/**
 * Helper function for {@link replace_export_type_placeholders}. Renders specifiv members to their markdown/html representation.
 */
function stringify(member: TypeElement, lang: keyof typeof SHIKI_LANGUAGE_MAP = 'ts'): string {
	if (!member) return '';

	// It's important to always use two newlines after a dom tag or else markdown does not render it properly

	const bullet_block =
		(member.bullets?.length ?? 0) > 0
			? `\n\n<div class="ts-block-property-bullets">\n\n${member.bullets?.join('\n')}\n\n</div>`
			: '';

	const comment = member.comment
		? '\n\n' +
			member.comment
				.replace(/\/\/\/ type: (.+)/g, '/** @type {$1} */')
				.replace(/^(  )+/gm, (match, spaces) => {
					return '\t'.repeat(match.length / 2);
				})
		: '';

	const child_block =
		(member.children?.length ?? 0) > 0
			? `\n\n<div class="ts-block-property-children">${member.children
					?.map((val) => stringify(val, lang))
					.join('\n')}</div>`
			: '';

	return (
		`<div class="ts-block-property">${fence(member.snippet, lang)}` +
		`<div class="ts-block-property-details">` +
		bullet_block +
		comment +
		child_block +
		(bullet_block || comment || child_block ? '\n\n' : '') +
		'</div>\n</div>'
	);
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
async function create_snippet_cache(should: boolean) {
	const cache = new Map();
	const directory = find_nearest_node_modules(import.meta.url) + '/.snippets';

	function get_file(source: string) {
		const hash = createHash('sha256');
		hash.update(source);
		const digest = hash.digest().toString('base64').replace(/\//g, '-');

		return `${directory}/${digest}.html`;
	}

	return {
		get(source: string) {
			if (!should) return;

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

function create_type_links(
	modules: Modules | undefined,
	resolve_link?: (module_name: string, type_name: string) => { slug: string; page: string }
): {
	type_regex: RegExp | null;
	type_links: Map<string, { slug: string; page: string; relativeURL: string }> | null;
} {
	if (!modules || modules.length === 0 || !resolve_link)
		return { type_regex: null, type_links: null };

	const type_regex = new RegExp(
		`(import\\(&apos;(?:svelte|@sveltejs\\/kit)&apos;\\)\\.)?\\b(${modules
			.flatMap((module) => module.types)
			.map((type) => type?.name)
			.join('|')})\\b`,
		'g'
	);

	/** @type {Map<string, { slug: string; page: string; relativeURL: string; }>} */
	const type_links = new Map();

	for (const module of modules) {
		if (!module || !module.name) continue;

		for (const type of module.types ?? []) {
			const link = resolve_link(module.name, type.name);
			type_links.set(type.name, { ...link, relativeURL: link.page + '#' + link.slug });
		}
	}

	return { type_regex, type_links };
}

function parse_options(source: string, language: string) {
	METADATA_REGEX.lastIndex = 0;

	const options: SnippetOptions = { file: null, link: false, copy: language !== 'dts' };

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
	return source.replace(/^([\-\+])?((?:    )+)/gm, (match, prefix = '', spaces) => {
		if ((prefix && language !== 'diff') || language === 'yaml') return match;

		return prefix + '\t'.repeat(spaces.length / 4) + ' '.repeat(spaces.length % 4);
	});
}

function replace_blank_lines(html: string) {
	// preserve blank lines in output (maybe there's a more correct way to do this?)
	return html.replaceAll(/<div class='line'>(&nbsp;)?<\/div>/g, '<div class="line">\n</div>');
}

async function syntax_highlight({
	source,
	filename,
	language,
	twoslashBanner,
	options
}: {
	source: string;
	filename: string;
	language: string;
	twoslashBanner?: TwoslashBanner;
	options: SnippetOptions;
}) {
	let html = '';

	if (/^(dts|yaml|yml)/.test(language)) {
		html = replace_blank_lines(
			await codeToHtml(source, {
				lang: language === 'dts' ? 'ts' : language,
				theme
			})
		);
	} else if (/^(js|ts)/.test(language)) {
		try {
			const banner = twoslashBanner?.(filename, source, language, options);

			if (banner) {
				if (source.includes('// @filename:')) {
					source = source.replace('// @filename:', `${banner}\n\n// @filename:`);
				} else {
					source = source.replace(
						/^(?!\/\/ @)/m,
						`${banner}\n\n// @filename: index.${language}\n// ---cut---\n`
					);
				}
			}

			html = await codeToHtml(source, {
				lang: 'ts',
				theme,
				transformers: [transformerTwoslash({})]
			});
		} catch (e) {
			console.error(`Error compiling snippet in ${filename}`);
			// @ts-ignore
			console.error(e.code);
			throw e;
		}

		html = replace_blank_lines(html);
	} else if (language === 'diff') {
		const lines = source.split('\n').map((content) => {
			let type = null;
			if (/^[\+\-]/.test(content)) {
				type = content[0] === '+' ? 'inserted' : 'deleted';
				content = content.slice(1);
			}

			return {
				type,
				content: escape(content)
			};
		});

		html = `<pre class="language-diff" style="background-color: var(--shiki-color-background)"><code>${lines
			.map((line) => {
				if (line.type) return `<span class="${line.type}">${line.content}\n</span>`;
				return line.content + '\n';
			})
			.join('')}</code></pre>`;
	} else {
		const highlighted = await codeToHtml(source, {
			lang: SHIKI_LANGUAGE_MAP[language as keyof typeof SHIKI_LANGUAGE_MAP],
			theme
		});

		html = replace_blank_lines(highlighted);
	}

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

async function async_replace(
	inputString: string,
	regex: RegExp,
	asyncCallback: (match: RegExpExecArray) => string | Promise<string>
) {
	let match;
	let previousLastIndex = 0;
	let parts = [];

	// While there is a match
	while ((match = regex.exec(inputString)) !== null) {
		// Add the text before the match
		parts.push(inputString.slice(previousLastIndex, match.index));

		// Perform the asynchronous operation for the match and add the result
		parts.push(await asyncCallback(match));

		// Update the previous last index
		previousLastIndex = regex.lastIndex;

		// Avoid infinite loops with zero-width matches
		if (match.index === regex.lastIndex) {
			regex.lastIndex++;
		}
	}

	// Add the remaining text
	parts.push(inputString.slice(previousLastIndex));

	return parts.join('');
}
