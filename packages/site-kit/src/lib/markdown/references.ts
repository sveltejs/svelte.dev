import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { decode_html_entities, escape_html } from './utils.ts';

/** A module-wide destination, or documentation URLs for individual exports. */
export type DocumentationReferences = Record<string, string | Record<string, string>>;

interface Reference {
	start: number;
	end: number;
	href: string;
}

function shift(references: Reference[], offset: number) {
	return references.map((reference) => ({
		...reference,
		start: reference.start + offset,
		end: reference.end + offset
	}));
}

/** Resolve bindings locally without loading or type-checking the documented packages. */
export function find_references(
	source: string,
	language: string,
	references: DocumentationReferences,
	reference_module?: string,
	prelude = '',
	/** Whether `$name` refers to the `name` store, as in a Svelte instance script or template. */
	stores = false
): Reference[] {
	if (!['js', 'ts', 'dts', 'svelte', 'sv'].includes(language)) return [];

	if (language === 'svelte' || language === 'sv') {
		return find_svelte_references(source, references, reference_module, prelude);
	}

	// Imports above ---cut--- still establish the bindings used in the visible snippet.
	const filename_index = prelude.lastIndexOf('// @filename:');
	const prefix = filename_index === -1 ? prelude : prelude.slice(filename_index);
	const text = prefix + '\n' + source;
	const offset = prefix.length + 1;
	const filename = language === 'js' ? 'snippet.js' : 'snippet.ts';
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
	/** Top-level imports by local name, for resolving `$store` auto-subscriptions. */
	const imports = new Map<string, { module: string; name?: string }>();
	const result: Reference[] = [];

	function bind(node: ts.Identifier, module: string, name?: string) {
		const symbol = checker.getSymbolAtLocation(node);
		if (symbol) bindings.set(symbol, { module, name });
		imports.set(node.text, { module, name });
	}

	for (const statement of file.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
			continue;
		const module = statement.moduleSpecifier.text;
		const clause = statement.importClause;
		if (!clause || !references[module]) continue;
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
		if (
			ts.isImportTypeNode(node) &&
			ts.isLiteralTypeNode(node.argument) &&
			ts.isStringLiteral(node.argument.literal) &&
			node.qualifier &&
			ts.isIdentifier(node.qualifier)
		) {
			add(node.qualifier, node.argument.literal.text, node.qualifier.text);
		}

		if (ts.isIdentifier(node)) {
			const parent = node.parent;
			const symbol = ts.isShorthandPropertyAssignment(parent)
				? checker.getShorthandAssignmentValueSymbol(parent)
				: checker.getSymbolAtLocation(node);
			const binding = symbol && bindings.get(symbol);
			if (binding?.name) {
				add(node, binding.module, binding.name);
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
			} else if (stores && !symbol && node.text.startsWith('$') && node.text.length > 1) {
				// `$page` subscribes to the imported `page` store.
				const store = imports.get(node.text.slice(1));
				if (store?.name) add(node, store.module, store.name);
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
	return result.sort((a, b) => a.start - b.start);
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
		// Examples often stop mid-markup (e.g. an unclosed `<form use:enhance>`).
		try {
			ast = parse(source, { modern: true, loose: true });
		} catch {}
	}
	if (!ast) {
		// Some examples are deliberately invalid even for the loose parser (e.g. two
		// `<svelte:options>` or `{@debug}` with an expression). Their scripts can still be linked
		// on their own.
		return [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/g)].flatMap((match) => {
			const offset = match.index + match[0].indexOf('>') + 1;
			return shift(
				find_references(match[1], 'ts', references, reference_module, prelude, true),
				offset
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

	function walk(value: unknown) {
		if (Array.isArray(value)) {
			for (const child of value) walk(child);
			return;
		}
		if (!value || typeof value !== 'object' || !('type' in value)) return;
		const node = value as SvelteNode;

		if (
			(node.type === 'UseDirective' ||
				node.type === 'TransitionDirective' ||
				node.type === 'AnimateDirective') &&
			typeof node.name === 'string' &&
			typeof node.start === 'number'
		) {
			// `use:enhance`, `transition:fade` and `animate:flip` reference a value by name.
			const start = node.start + source.slice(node.start).indexOf(':') + 1;
			expression({ start, end: start + node.name.length });
			expression(node.expression);
			return;
		}

		for (const [key, child] of Object.entries(node)) {
			if (key === 'expression' || key === 'test') expression(child);
			else walk(child);
		}
	}

	// Svelte rejects instance declarations that reuse a module import's name, so both scripts
	// can share one scope.
	copy(ast.module?.content);
	code += '\n';
	copy(ast.instance?.content);
	walk(ast.fragment);

	return find_references(code, 'ts', references, reference_module, prelude, true).flatMap(
		(reference) => {
			const range = ranges.find(
				(range) => reference.start >= range.start && reference.end <= range.end
			);
			return range ? shift([reference], range.offset) : [];
		}
	);
}

interface Element {
	id: number;
	open: string;
	close: string;
	ignored: boolean;
	anchor: boolean;
	/** Inside a diff example's removed or added lines */
	diff?: 'remove' | 'add';
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
					anchor: tag === 'a' || stack.at(-1)?.anchor === true,
					diff:
						(/class="[^"]*\bhighlight (remove|add)\b/.exec(token)?.[1] as 'remove' | 'add') ??
						stack.at(-1)?.diff
				});
			}
			continue;
		}
		if (stack.at(-1)?.ignored || !stack.some((element) => element.open.startsWith('<code')))
			continue;
		for (const character of token.matchAll(/&(?:#\d+|#x[\da-fA-F]+|\w+);|[\s\S]/g)) {
			const decoded = decode_html_entities(character[0]);
			source += decoded;
			for (let i = 0; i < decoded.length; i++)
				characters.push({
					start: match.index + character.index,
					end: match.index + character.index + character[0].length,
					ancestors: [...stack]
				});
		}
	}

	const find = (code: string) =>
		find_references(code, language, references, reference_module, prelude);

	// Diff examples show the old and new code together, which may declare the same binding twice.
	// Resolve each version on its own, blanking the other version's lines while keeping offsets.
	const removed = (character: Character | undefined) =>
		character?.ancestors.at(-1)?.diff === 'remove';
	const added = (character: Character | undefined) => character?.ancestors.at(-1)?.diff === 'add';
	const blank = (hidden: (character: Character) => boolean) =>
		source
			.split('')
			.map((char, i) => (char !== '\n' && hidden(characters[i]) ? ' ' : char))
			.join('');
	const found =
		characters.some(removed) && characters.some(added)
			? [
					...find(blank(removed)).filter((reference) => !removed(characters[reference.start])),
					...find(blank(added)).filter((reference) => removed(characters[reference.start]))
				]
			: find(source);

	const insertions: Array<{ index: number; text: string }> = [];
	for (const reference of found) {
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
		const href = escape_html(reference.href);
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
