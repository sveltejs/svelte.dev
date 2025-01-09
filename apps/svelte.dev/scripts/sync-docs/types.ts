import fs from 'node:fs';
import ts from 'typescript';
import { format } from 'prettier';
import {
	type Modules,
	type Declaration,
	type TypeElement,
	strip_origin
} from '@sveltejs/site-kit/markdown';

export async function read_types(base: string, modules: Modules) {
	{
		const ignore_list = [
			'*.svelte', // ambient file import declaration
			'svelte/types/compiler/preprocess', // legacy entrypoint
			'svelte/types/compiler/interfaces' // legacy entrypoint
		];
		const code = read_d_ts_file(base + 'index.d.ts');
		const node = ts.createSourceFile('index.d.ts', code, ts.ScriptTarget.Latest, true);

		for (const statement of node.statements) {
			if (ts.isModuleDeclaration(statement)) {
				// @ts-ignore
				const name = statement.name.text || statement.name.escapedText;

				if (ignore_list.includes(name)) {
					continue;
				}

				// @ts-ignore
				const comment = strip_origin(statement.jsDoc?.[0].comment ?? '');

				// @ts-ignore
				modules.push({
					name,
					comment,
					// @ts-ignore
					...(await get_types(code, statement.body?.statements))
				});
			}
		}
	}

	return modules;
}

export async function get_types(code: string, statements: ts.NodeArray<ts.Statement>) {
	const exports: Declaration[] = [];
	const types: Declaration[] = [];

	if (statements) {
		for (const statement of statements) {
			const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;

			const export_modifier = modifiers?.find(
				(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
			);

			if (!export_modifier) continue;

			if (
				ts.isClassDeclaration(statement) ||
				ts.isInterfaceDeclaration(statement) ||
				ts.isTypeAliasDeclaration(statement) ||
				ts.isModuleDeclaration(statement) ||
				ts.isVariableStatement(statement) ||
				ts.isFunctionDeclaration(statement)
			) {
				const name_node = ts.isVariableStatement(statement)
					? statement.declarationList.declarations[0]
					: statement;

				// @ts-ignore no idea why it's complaining here
				const name = name_node.name?.escapedText;

				let start = statement.pos;
				let comment = '';
				let deprecated_notice: string | null = null;
				let since_notice: string | null = null;

				// @ts-ignore i think typescript is bad at typescript
				if (statement.jsDoc) {
					// @ts-ignore
					const jsDoc = statement.jsDoc[0];

					// `@link` JSDoc tags (and maybe others?) turn this property into an array, which we need to join manually
					if (Array.isArray(jsDoc.comment)) {
						comment = (jsDoc.comment as any[])
							.map(({ name, text }) => strip_origin(name ? `\`${name.escapedText}\`` : text))
							.join('');
					} else {
						comment = strip_origin(jsDoc.comment ?? '');
					}

					if (jsDoc.tags) {
						for (const tag of jsDoc.tags) {
							if (tag.tagName.escapedText === 'deprecated') {
								deprecated_notice = tag.comment && strip_origin(tag.comment);
							}

							if (tag.tagName.escapedText === 'since') {
								since_notice = tag.comment;
							}

							if (tag.tagName.escapedText === 'example') {
								comment += `\n\n${tag.comment}`;
							}
						}
					}

					// @ts-ignore
					start = jsDoc.end;
				}

				const i = code.indexOf('export', start);
				start = i + 6;

				let children: TypeElement[] = [];

				let snippet_unformatted = code.slice(start, statement.end).trim();

				if (ts.isInterfaceDeclaration(statement) || ts.isClassDeclaration(statement)) {
					if (statement.members.length > 0) {
						for (const member of statement.members) {
							// for some reason, the existence of any private fields results
							// in a useless `#private;` being added to the definition
							if (
								member.name?.getText() === '#private' &&
								ts.isPropertyDeclaration(member) &&
								!member.initializer
							) {
								continue;
							}

							children.push(munge_type_element(member as any)!);
						}

						children = children.filter(Boolean);

						// collapse `interface Foo {/* lots of stuff*/}` into `interface Foo {…}`
						const first = statement.members.at(0)!;
						const last = statement.members.at(-1)!;

						let body_start = first.pos - start;
						while (snippet_unformatted[body_start] !== '{') body_start -= 1;

						let body_end = last.end - start;
						while (snippet_unformatted[body_end] !== '}') body_end += 1;

						snippet_unformatted =
							snippet_unformatted.slice(0, body_start + 1) +
							'/*…*/' +
							snippet_unformatted.slice(body_end);
					}
				}

				const snippet = (
					await format(snippet_unformatted, {
						parser: 'typescript',
						printWidth: 60,
						useTabs: true,
						singleQuote: true,
						trailingComma: 'none'
					})
				)
					.replace(/\s*(\/\*…\*\/)\s*/g, '/*…*/')
					.trim();

				const collection =
					ts.isVariableStatement(statement) ||
					ts.isClassDeclaration(statement) ||
					ts.isFunctionDeclaration(statement)
						? exports
						: types;

				let declaration = collection.find((statement) => statement.name === name);

				if (declaration) {
					// TODO tidy these up in the source
					if (cleanup_comment(comment) !== declaration.comment) {
						console.warn(`${name} overload has mismatched comment`);
					}

					if (deprecated_notice !== declaration.deprecated) {
						console.warn(`${name} overload has mismatched deprecation notices`);
					}
				} else {
					declaration = {
						name,
						comment: cleanup_comment(comment),
						deprecated: deprecated_notice,
						since: since_notice,
						overloads: []
					};

					collection.push(declaration);
				}

				declaration.overloads.push({
					snippet,
					children
				});
			}
		}

		types.sort((a, b) => (a.name < b.name ? -1 : 1));
		exports.sort((a, b) => (a.name < b.name ? -1 : 1));
	}

	return { types, exports };
}

function munge_type_element(member: ts.TypeElement, depth = 1): TypeElement | undefined {
	// @ts-ignore
	const doc = member.jsDoc?.[0];

	if (/private api|DO NOT USE/i.test(doc?.comment)) return;

	const children: TypeElement[] = [];

	// @ts-ignore
	const name = member.name?.escapedText ?? member.name?.getText() ?? 'unknown';
	let snippet = member.getText();

	for (let i = -1; i < depth; i += 1) {
		snippet = snippet.replace(/^\t/gm, '');
	}

	if (
		ts.isPropertySignature(member) &&
		ts.isTypeLiteralNode(member.type!) &&
		member.type.members.some((member) => (member as any).jsDoc?.[0].comment)
	) {
		let a = 0;
		while (snippet[a] !== '{') a += 1;

		snippet = snippet.slice(0, a + 1) + '/*…*/}';

		for (const child of member.type.members) {
			children.push(munge_type_element(child, depth + 1)!);
		}
	}

	const bullets: string[] = [];

	for (const tag of doc?.tags ?? []) {
		const type = tag.tagName.escapedText;

		switch (tag.tagName.escapedText) {
			case 'private':
				bullets.push(`- <span class="tag">private</span> ${tag.comment || ''}`);
				break;

			case 'readonly':
				bullets.push(`- <span class="tag">readonly</span> ${tag.comment || ''}`);
				break;

			case 'param':
				bullets.push(`- \`${tag.name.getText()}\` ${tag.comment || ''}`);
				break;

			case 'default':
				bullets.push(`- <span class="tag">default</span> \`${tag.comment || ''}\``);
				break;

			case 'returns':
				bullets.push(`- <span class="tag">returns</span> ${tag.comment || ''}`);
				break;

			case 'deprecated':
				bullets.push(`- <span class="tag deprecated">deprecated</span> ${tag.comment || ''}`);
				break;

			case 'since':
				bullets.push(`- <span class="tag since">available since</span> v${tag.comment}`);
				break;

			default:
				console.log(`unhandled JSDoc tag: ${type}`);
		}
	}

	return {
		name,
		snippet,
		comment: cleanup_comment(doc?.comment),
		bullets,
		children
	};
}

function cleanup_comment(comment: string = '') {
	return strip_origin(comment)
		.replace(/\/\/\/ type: (.+)/g, '/** @type {$1} */')
		.replace(/\/\/\/ errors: (.+)/g, '// @errors: $1') // see read_d_ts_file
		.replace(/^(  )+/gm, (match: string, spaces: string) => {
			return '\t'.repeat(match.length / 2);
		});
}

export function read_d_ts_file(file: string) {
	// We can't use JSDoc comments inside JSDoc, so we would get ts(7031) errors if
	// we didn't ignore this error specifically for `/// file:` code examples
	const str = fs.readFileSync(file, 'utf-8');

	return str.replace(/(\s*\*\s*)```js([\s\S]+?)```/g, (match, prefix, code) => {
		// For some reason, typescript 5.1> is reading @errors as a jsdoc tag, and splitting it into separate pieces,
		// which is why we use /// errors: instead and then replace it in the end
		return `${prefix}\`\`\`js${prefix}/// errors: 7031${code}\`\`\``;
	});
}
