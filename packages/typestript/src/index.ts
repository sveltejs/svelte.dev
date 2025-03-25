import * as acorn from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import { walk } from 'zimmerframe';
import type { TSESTree } from '@typescript-eslint/types';
import MagicString, { SourceMap } from 'magic-string';

const TSParser = acorn.Parser.extend(tsPlugin());

export function stripTypes(content: string): { content: string; sourceMap: SourceMap } {
	console.log(content);

	const ast = TSParser.parse(content, {
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});

	const s = new MagicString(content);

	walk(ast as unknown as TSESTree.Node, null, {
		_: (node, context) => {
			console.log(node.type);
			if (node.type.startsWith('TS') && node.type !== 'TSAsExpression') {
				const { start, end } = node as unknown as { start: number; end: number };
				s.overwrite(start, end, ' '.repeat(end - start));
			} else {
				context.next();
			}
		},
		TSAsExpression: (node) => {
			const { end: start } = node.expression as unknown as { end: number; start: number };
			const { end } = node.typeAnnotation as unknown as { start: number; end: number };
			s.overwrite(start, end, ' '.repeat(end - start));
		},
		ImportDeclaration: (node, context) => {
			if (
				node.importKind === 'type' ||
				node.specifiers.every(
					(specifier) => specifier.type === 'ImportSpecifier' && specifier.importKind === 'type'
				)
			) {
				const { start, end } = node as unknown as { start: number; end: number };
				s.overwrite(start, end, ' '.repeat(end - start));
			} else {
				context.next();
			}
		},
		ImportSpecifier: (node, context) => {
			if (node.importKind === 'type') {
				const { start, end } = node as unknown as { start: number; end: number };
				s.overwrite(start, end, ' '.repeat(end - start));
			} else {
				context.next();
			}
		}
	});

	console.log(s.toString());

	return {
		content: s.toString(),
		sourceMap: s.generateMap({
			hires: true
		})
	};
}
