/** @import { TSESTree } from '@typescript-eslint/types' */
import * as acorn from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import { walk } from 'zimmerframe';
import MagicString from 'magic-string';

const TSParser = acorn.Parser.extend(tsPlugin());

/**
 * @param {string} content
 * @returns {MagicString}
 */
export function stripTypes(content) {
	const ast = /** @type {unknown} */ (
		TSParser.parse(content, {
			sourceType: 'module',
			ecmaVersion: 13,
			locations: true
		})
	);

	const s = new MagicString(content);

	walk(/** @type {TSESTree.Node & { start: number, end: number }} */ (ast), null, {
		_: (node, context) => {
			if (
				node.type.startsWith('TS') &&
				!['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression'].includes(node.type)
			) {
				const { start, end } = node;
				s.overwrite(start, end, ' '.repeat(end - start));
			} else {
				context.next();
			}
		},
		TSAsExpression: (node) => {
			handle_type_expression(node, s);
		},
		TSSatisfiesExpression: (node) => {
			handle_type_expression(node, s);
		},
		TSNonNullExpression: (node, context) => {
			s.overwrite(node.end - 1, node.end, ' ');
			context.next();
		},
		ImportDeclaration: (node, context) => {
			if (
				node.importKind === 'type' ||
				node.specifiers.every(
					(specifier) => specifier.type === 'ImportSpecifier' && specifier.importKind === 'type'
				)
			) {
				const { start, end } = node;
				s.overwrite(start, end, ' '.repeat(end - start));
			} else {
				context.next();
			}
		},
		ImportSpecifier: (node, context) => {
			if (node.importKind === 'type') {
				const { start, end } = node;
				s.overwrite(start, end, ' '.repeat(end - start));
			} else {
				context.next();
			}
		}
	});

	return s;
}

/**
 * @param {TSESTree.Node} node
 * @param {MagicString} s
 */
function handle_type_expression(node, s) {
	// @ts-ignore
	const start = node.expression.end;

	// @ts-ignore
	const end = node.typeAnnotation.end;

	s.overwrite(start, end, ' '.repeat(end - start));
}
