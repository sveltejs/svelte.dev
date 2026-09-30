import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { decode_html_entities } from './utils.ts';

/** A module-wide destination, or documentation URLs for individual exports. */
export type DocumentationReferences = Record<string, string | Record<string, string>>;

interface Reference {
	start: number;
	end: number;
	href: string;
}

/** Resolve bindings locally without loading or type-checking the documented packages. */
export function find_references(
	source: string,
	language: string,
	references: DocumentationReferences,
	reference_module?: string,
	prelude = ''
): Reference[] {
	if (!['js', 'javascript', 'ts', 'typescript', 'dts', 'svelte', 'sv'].includes(language))
		return [];

	if (language === 'svelte' || language === 'sv') {
		return find_svelte_references(source, references, reference_module, prelude);
	}

	// Imports above ---cut--- still establish the bindings used in the visible snippet.
	const filename_index = prelude.lastIndexOf('// @filename:');
	const prefix = filename_index === -1 ? prelude : prelude.slice(filename_index);
	const text = prefix + '\n' + source;
	const offset = prefix.length + 1;
	const filename = language === 'js' || language === 'javascript' ? 'snippet.js' : 'snippet.ts';
	const file = ts.createSourceFile(
		filename,
		text,
		ts.ScriptTarget.Latest,
		true,
		filename.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS
	);
	const program = ts.createProgram(
		[filename],
		{
			noLib: true,
			noResolve: true,
			allowJs: true,
			checkJs: true
		},
		{
			getSourceFile: (name) => (name === filename ? file : undefined),
			getDefaultLibFileName: () => '',
			writeFile: () => {},
			getCurrentDirectory: () => '',
			getDirectories: () => [],
			fileExists: (name) => name === filename,
			readFile: (name) => (name === filename ? text : undefined),
			getCanonicalFileName: (name) => name,
			useCaseSensitiveFileNames: () => true,
			getNewLine: () => '\n'
		}
	);
	const checker = program.getTypeChecker();
	const bindings = new Map<ts.Symbol, { module: string; name?: string }>();
	const result: Reference[] = [];
	const visited = new Set<ts.Node>();

	function bind(node: ts.Identifier, module: string, name?: string) {
		const symbol = checker.getSymbolAtLocation(node);
		if (symbol) bindings.set(symbol, { module, name });
	}

	for (const statement of file.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
			continue;
		const module = statement.moduleSpecifier.text;
		const clause = statement.importClause;
		if (!clause || !references[module]) continue;
		if (clause.name) bind(clause.name, module, 'default');
		if (clause.namedBindings) {
			if (ts.isNamespaceImport(clause.namedBindings)) {
				bind(clause.namedBindings.name, module);
			} else {
				for (const specifier of clause.namedBindings.elements) {
					bind(specifier.name, module, (specifier.propertyName ?? specifier.name).text);
				}
			}
		}
	}

	function add(node: ts.Node, module: string, name: string) {
		const destination = references[module];
		const href = typeof destination === 'string' ? destination : destination?.[name];
		const start = node.getStart(file) - offset;
		if (typeof href === 'string' && start >= 0)
			result.push({ start, end: node.end - offset, href });
	}

	function visit(node: ts.Node) {
		if (visited.has(node)) return;
		visited.add(node);

		if (
			ts.isImportTypeNode(node) &&
			ts.isLiteralTypeNode(node.argument) &&
			ts.isStringLiteral(node.argument.literal) &&
			node.qualifier
		) {
			// Only the exported member, not an arbitrary nested property, has a module destination.
			const qualifier = node.qualifier;
			add(
				ts.isIdentifier(qualifier) ? qualifier : qualifier.left,
				node.argument.literal.text,
				ts.isIdentifier(qualifier) ? qualifier.text : qualifier.left.getText(file)
			);
		}

		if (ts.isIdentifier(node)) {
			const parent = node.parent;
			const symbol = ts.isShorthandPropertyAssignment(parent)
				? checker.getShorthandAssignmentValueSymbol(parent)
				: checker.getSymbolAtLocation(node);
			const binding = symbol && bindings.get(symbol);
			if (binding?.name) {
				// Property names aren't references to an imported value (shorthand properties are).
				if (
					!(ts.isPropertyAssignment(parent) && parent.name === node) &&
					!(ts.isPropertyAccessExpression(parent) && parent.name === node)
				) {
					add(node, binding.module, binding.name);
				}
			} else if (binding && (ts.isPropertyAccessExpression(parent) || ts.isQualifiedName(parent))) {
				const member = ts.isPropertyAccessExpression(parent) ? parent.name : parent.right;
				if ((ts.isPropertyAccessExpression(parent) ? parent.expression : parent.left) === node) {
					add(member, binding.module, member.text);
				}
			} else if (ts.isImportSpecifier(parent) && parent.propertyName === node) {
				const declaration = parent.parent.parent.parent;
				if (
					ts.isImportDeclaration(declaration) &&
					ts.isStringLiteral(declaration.moduleSpecifier)
				) {
					add(node, declaration.moduleSpecifier.text, node.text);
				}
			} else if (
				!symbol?.declarations?.length &&
				reference_module &&
				((ts.isTypeReferenceNode(parent) && parent.typeName === node) ||
					(ts.isExpressionWithTypeArguments(parent) && parent.expression === node))
			) {
				add(node, reference_module, node.text);
			}
		}

		ts.forEachChild(node, visit);
		for (const doc of (node as ts.Node & { jsDoc?: ts.JSDoc[] }).jsDoc ?? []) visit(doc);
	}

	visit(file);
	return result
		.sort((a, b) => a.start - b.start)
		.filter((reference, index, all) => index === 0 || reference.start >= all[index - 1].end);
}

interface SvelteNode {
	type: string;
	start?: number;
	end?: number;
	[key: string]: unknown;
}

function find_svelte_references(
	source: string,
	references: DocumentationReferences,
	reference_module?: string,
	prelude = ''
): Reference[] {
	let ast;
	try {
		ast = parse(source, { modern: true });
	} catch {
		// Incomplete examples can still contain complete scripts. Ignore commented-out scripts.
		const uncommented = source.replace(/<!--[\s\S]*?-->/g, (comment) => ' '.repeat(comment.length));
		return [...uncommented.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/g)].flatMap((match) => {
			const offset = match.index + match[0].indexOf('>') + 1;
			return find_references(match[1], 'ts', references, reference_module, prelude).map(
				(reference) => ({
					...reference,
					start: reference.start + offset,
					end: reference.end + offset
				})
			);
		});
	}

	let code = '';
	const ranges: Array<{ start: number; end: number; offset: number }> = [];

	function copy(value: unknown) {
		const node = value as SvelteNode | undefined;
		if (typeof node?.start !== 'number' || typeof node.end !== 'number') return;
		ranges.push({
			start: code.length,
			end: code.length + node.end - node.start,
			offset: node.start - code.length
		});
		code += source.slice(node.start, node.end);
	}

	function expression(value: unknown) {
		if (!value) return;
		code += '\nvoid (';
		copy(value);
		code += ');\n';
	}

	function binding(value: unknown) {
		if (!value) return;
		code += '\nlet ';
		if (typeof value === 'string') code += value;
		else copy(value);
		code += ';\n';
	}

	function walk(value: unknown) {
		if (Array.isArray(value)) {
			for (const child of value) walk(child);
			return;
		}
		if (!value || typeof value !== 'object' || !('type' in value)) return;
		const node = value as SvelteNode;

		if (node.type === 'Fragment') {
			code += '\n{\n';
			for (const child of node.nodes as SvelteNode[]) {
				if (child.type === 'SnippetBlock') binding(child.expression);
			}
			walk(node.nodes);
			code += '\n}\n';
			return;
		}
		if (node.type === 'EachBlock') {
			expression(node.expression);
			code += '\n{\n';
			binding(node.context);
			binding(node.index);
			expression(node.key);
			walk(node.body);
			code += '\n}\n';
			walk(node.fallback);
			return;
		}
		if (node.type === 'AwaitBlock') {
			expression(node.expression);
			walk(node.pending);
			for (const [branch, variable] of [
				[node.then, node.value],
				[node.catch, node.error]
			]) {
				code += '\n{\n';
				binding(variable);
				walk(branch);
				code += '\n}\n';
			}
			return;
		}
		if (node.type === 'SnippetBlock') {
			code += '\nvoid ((';
			for (const [i, parameter] of (node.parameters as SvelteNode[]).entries()) {
				if (i) code += ',';
				copy(parameter);
			}
			code += ') => {\n';
			walk(node.body);
			code += '\n});\n';
			return;
		}
		if (node.type === 'ConstTag') {
			copy(node.declaration);
			code += ';\n';
			return;
		}
		if (node.type === 'LetDirective') return;

		if (Array.isArray(node.attributes)) {
			walk(node.attributes);
			code += '\n{\n';
			for (const attribute of node.attributes as SvelteNode[]) {
				if (attribute.type === 'LetDirective') binding(attribute.expression ?? attribute.name);
			}
			walk(node.fragment);
			code += '\n}\n';
			return;
		}

		for (const [key, child] of Object.entries(node)) {
			if (key === 'expression' || key === 'test') expression(child);
			else walk(child);
		}
	}

	// ESTree's Program type omits the offsets provided by the Svelte parser.
	const module_content = ast.module?.content as unknown as
		{ start: number; end: number } | undefined;
	const instance_content = ast.instance?.content as unknown as
		{ start: number; end: number } | undefined;
	const module_source = module_content
		? source.slice(module_content.start, module_content.end)
		: '';
	const instance_source = instance_content
		? source.slice(instance_content.start, instance_content.end)
		: '';
	const module_file = ts.createSourceFile('module.ts', module_source, ts.ScriptTarget.Latest, true);
	const instance_file = ts.createSourceFile(
		'instance.ts',
		instance_source,
		ts.ScriptTarget.Latest,
		true
	);

	function names(node: ts.Node): string[] {
		if (ts.isIdentifier(node)) return [node.text];
		if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node)) {
			return node.elements.flatMap((element) =>
				ts.isBindingElement(element) ? names(element.name) : []
			);
		}
		if (ts.isVariableStatement(node))
			return node.declarationList.declarations.flatMap((declaration) => names(declaration.name));
		if (ts.isImportDeclaration(node)) {
			const clause = node.importClause;
			return [
				...(clause?.name ? [clause.name.text] : []),
				...(clause?.namedBindings
					? ts.isNamespaceImport(clause.namedBindings)
						? [clause.namedBindings.name.text]
						: clause.namedBindings.elements.map((element) => element.name.text)
					: [])
			];
		}
		if ('name' in node && node.name && ts.isIdentifier(node.name as ts.Node))
			return [(node.name as ts.Identifier).text];
		return [];
	}

	const instance_names = new Set(instance_file.statements.flatMap(names));
	// Module bindings are visible to the instance, except where its own bindings shadow them.
	const module_prelude = module_file.statements
		.map((statement) => {
			if (ts.isImportDeclaration(statement) && statement.importClause) {
				const clause = statement.importClause;
				const parts: string[] = [];
				if (clause.name && !instance_names.has(clause.name.text)) parts.push(clause.name.text);
				if (clause.namedBindings) {
					if (ts.isNamespaceImport(clause.namedBindings)) {
						if (!instance_names.has(clause.namedBindings.name.text))
							parts.push(clause.namedBindings.getText(module_file));
					} else {
						const specifiers = clause.namedBindings.elements.filter(
							(element) => !instance_names.has(element.name.text)
						);
						if (specifiers.length)
							parts.push(
								`{ ${specifiers.map((element) => element.getText(module_file)).join(', ')} }`
							);
					}
				}
				return parts.length
					? `import ${clause.isTypeOnly ? 'type ' : ''}${parts.join(', ')} from ${statement.moduleSpecifier.getText(module_file)};`
					: '';
			}
			return names(statement).some((name) => instance_names.has(name))
				? ''
				: statement.getFullText(module_file);
		})
		.join('\n');

	copy(ast.instance?.content);
	walk(ast.fragment);

	const module_references = module_content
		? find_references(module_source, 'ts', references, reference_module, prelude).map(
				(reference) => ({
					...reference,
					start: reference.start + module_content.start,
					end: reference.end + module_content.start
				})
			)
		: [];
	return [
		...module_references,
		...find_references(
			code,
			'ts',
			references,
			reference_module,
			prelude + '\n' + module_prelude
		).flatMap((reference) => {
			const range = ranges.find(
				(range) => reference.start >= range.start && reference.end <= range.end
			);
			return range
				? [
						{
							...reference,
							start: reference.start + range.offset,
							end: reference.end + range.offset
						}
					]
				: [];
		})
	].sort((a, b) => a.start - b.start);
}

interface Element {
	id: number;
	open: string;
	close: string;
	ignored: boolean;
	anchor: boolean;
}

interface Character {
	start: number;
	end: number;
	ancestors: Element[];
}

/** Decorate visible text, never the signatures/docs embedded in hidden popovers. */
export function link_references(
	html: string,
	references: DocumentationReferences,
	reference_module?: string,
	prelude = ''
): string {
	const language = /data-language="([^"]*)"/.exec(html)?.[1] ?? '';
	const characters: Character[] = [];
	const stack: Element[] = [];
	let source = '';
	let id = 0;

	for (const match of html.matchAll(/<[^>]*>|[^<]+/g)) {
		const token = match[0];
		if (token.startsWith('<')) {
			if (token.startsWith('</')) {
				stack.pop();
			} else if (!token.endsWith('/>') && !/^<(?:br|hr|img|input)\b/.test(token)) {
				const tag = /^<(\w+)/.exec(token)?.[1];
				if (!tag) continue;
				stack.push({
					id: id++,
					open: token,
					close: `</${tag}>`,
					ignored:
						stack.at(-1)?.ignored === true ||
						/class="[^"]*\btwoslash-(?:popover|query|completions)\b/.test(token),
					anchor: tag === 'a' || stack.at(-1)?.anchor === true
				});
			}
			continue;
		}
		if (stack.at(-1)?.ignored || !stack.some((element) => element.open.startsWith('<code')))
			continue;
		for (const character of token.matchAll(/&(?:#\d+|#x[\da-fA-F]+|\w+);|[\s\S]/g)) {
			const decoded = decode_html_entities(character[0].replace('&apos;', '&#39;'));
			source += decoded;
			for (let i = 0; i < decoded.length; i++)
				characters.push({
					start: match.index + character.index,
					end: match.index + character.index + character[0].length,
					ancestors: [...stack]
				});
		}
	}

	const insertions: Array<{ index: number; text: string }> = [];
	for (const reference of find_references(
		source,
		language,
		references,
		reference_module,
		prelude
	)) {
		const first = characters[reference.start];
		const last = characters[reference.end - 1];
		if (
			!first ||
			!last ||
			characters
				.slice(reference.start, reference.end)
				.some((character) => character.ancestors.at(-1)?.anchor)
		)
			continue;
		let common = 0;
		while (first.ancestors[common]?.id === last.ancestors[common]?.id && first.ancestors[common])
			common++;
		const start = first.ancestors.slice(common);
		const end = last.ancestors.slice(common);
		const href = reference.href
			.replaceAll('&', '&amp;')
			.replaceAll('"', '&quot;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;');
		// Split token wrappers at the boundaries so one anchor can span multiple tokens safely.
		insertions.push({
			index: first.start,
			text:
				start
					.toReversed()
					.map((element) => element.close)
					.join('') +
				`<a class="doc-reference" href="${href}">` +
				start.map((element) => element.open).join('')
		});
		insertions.push({
			index: last.end,
			text:
				end
					.toReversed()
					.map((element) => element.close)
					.join('') +
				'</a>' +
				end.map((element) => element.open).join('')
		});
	}

	for (const insertion of insertions.sort((a, b) => b.index - a.index)) {
		html = html.slice(0, insertion.index) + insertion.text + html.slice(insertion.index);
	}
	return html;
}
