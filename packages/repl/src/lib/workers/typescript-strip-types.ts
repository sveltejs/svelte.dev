import * as acorn from 'acorn';
import { walk, type Context, type Visitors } from 'zimmerframe';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import MagicString from 'magic-string';

const ParserWithTS = acorn.Parser.extend(tsPlugin());

/**
 * @param {FunctionExpression | FunctionDeclaration} node
 * @param {Context<any, any>} context
 */
function remove_this_param(
	node: acorn.FunctionExpression | acorn.FunctionDeclaration,
	context: Context<any, any>
) {
	const param = node.params[0] as any;
	if (param?.type === 'Identifier' && param.name === 'this') {
		if (param.typeAnnotation) {
			// the type annotation is blanked by another visitor, do it in two parts to prevent an overwrite error
			ts_blank_space(context, { start: param.start, end: param.typeAnnotation.start });
			ts_blank_space(context, {
				start: param.typeAnnotation.end,
				end: node.params[1]?.start || param.end
			});
		} else {
			ts_blank_space(context, {
				start: param.start,
				end: node.params[1]?.start || param.end
			});
		}
	}
	return context.next();
}

function typescript_invalid_feature(node: any, feature: string) {
	const e = new Error(`The REPL does not support ${feature}. Please remove it from your code.`);
	// @ts-expect-error Our REPL error handling needs this
	e.position = [node.start, node.end];
	throw e;
}

const empty = {
	type: 'EmptyStatement'
};

function ts_blank_space(context: Context<any, { ms: MagicString }>, node: any): void {
	const { start, end } = node;
	let i = start;
	while (i < end) {
		// Skip whitespace
		while (i < end && /\s/.test(context.state.ms.original[i])) i++;
		if (i >= end) break;
		// Find next whitespace or end
		let j = i + 1;
		while (j < end && !/\s/.test(context.state.ms.original[j])) j++;
		context.state.ms.overwrite(i, j, ' '.repeat(j - i));
		i = j;
	}
}

const visitors: Visitors<any, { ms: MagicString }> = {
	_(node, context) {
		if (node.typeAnnotation) ts_blank_space(context, node.typeAnnotation);
		if (node.typeParameters) ts_blank_space(context, node.typeParameters);
		if (node.typeArguments) ts_blank_space(context, node.typeArguments);
		if (node.returnType) ts_blank_space(context, node.returnType);
		if (node.accessibility) {
			ts_blank_space(context, { start: node.start, end: node.start + node.accessibility.length });
		}

		context.next();
	},
	Decorator(node, context) {
		ts_blank_space(context, node);
	},
	ImportDeclaration(node, context) {
		if (node.importKind === 'type') {
			ts_blank_space(context, node);
			return empty;
		}

		if (node.specifiers?.length > 0) {
			const specifiers = node.specifiers.filter((s: any, i: number) => {
				if (s.importKind !== 'type') return true;

				ts_blank_space(context, {
					start: s.start,
					end: node.specifiers[i + 1]?.start || s.end
				});
			});

			if (specifiers.length === 0) {
				ts_blank_space(context, node);
			}
		}
	},
	ExportNamedDeclaration(node, context) {
		if (node.exportKind === 'type') {
			ts_blank_space(context, node);
			return empty;
		}

		if (node.declaration) {
			const result = context.next();
			if (result?.declaration?.type === 'EmptyStatement') {
				ts_blank_space(context, node);
				return empty;
			}
			return result;
		}

		if (node.specifiers) {
			const specifiers = node.specifiers.filter((s: any, i: number) => {
				if (s.exportKind !== 'type') return true;

				ts_blank_space(context, {
					start: s.start,
					end: node.specifiers[i + 1]?.start || s.end
				});
			});

			if (specifiers.length === 0) {
				ts_blank_space(context, node);
			}
			return;
		}
	},
	ExportDefaultDeclaration(node, context) {
		if (node.exportKind === 'type') {
			ts_blank_space(context, node);
			return empty;
		} else {
			context.next();
		}
	},
	ExportAllDeclaration(node, context) {
		if (node.exportKind === 'type') {
			ts_blank_space(context, node);
			return empty;
		} else {
			context.next();
		}
	},
	PropertyDefinition(node, context) {
		if (node.accessor) {
			typescript_invalid_feature(node, 'accessor fields (related TSC proposal is not stage 4 yet)');
		} else {
			context.next();
		}
	},
	TSAsExpression(node, context) {
		ts_blank_space(context, { start: node.expression.end, end: node.end });
		context.visit(node.expression);
	},
	TSSatisfiesExpression(node, context) {
		ts_blank_space(context, { start: node.expression.end, end: node.end });
		context.visit(node.expression);
	},
	TSNonNullExpression(node, context) {
		ts_blank_space(context, { start: node.expression.end, end: node.end });
		context.visit(node.expression);
	},
	TSInterfaceDeclaration(node, context) {
		ts_blank_space(context, node);
		return empty;
	},
	TSTypeAliasDeclaration(node, context) {
		ts_blank_space(context, node);
		return empty;
	},
	TSTypeAssertion(node, context) {
		ts_blank_space(context, { start: node.start, end: node.expression.start });
		context.visit(node.expression);
	},
	TSEnumDeclaration(node, context) {
		typescript_invalid_feature(node, 'enums');
	},
	TSParameterProperty(node, context) {
		if ((node.readonly || node.accessibility) && context.path.at(-2)?.kind === 'constructor') {
			typescript_invalid_feature(node, 'accessibility modifiers on constructor parameters');
		}
		ts_blank_space(context, { start: node.start, end: node.parameter.start });
		context.visit(node.parameter);
	},
	TSInstantiationExpression(node, context) {
		ts_blank_space(context, { start: node.start, end: node.expression.start });
		context.visit(node.expression);
	},
	FunctionExpression: remove_this_param,
	FunctionDeclaration: remove_this_param,
	TSDeclareFunction(node, context) {
		ts_blank_space(context, node);
		return empty;
	},
	ClassDeclaration(node, context) {
		if (node.declare || node.abstract) {
			ts_blank_space(context, node);
			return empty;
		}

		if (node.implements?.length) {
			const implements_keyword_start = context.state.ms.original.lastIndexOf(
				'implements',
				node.implements[0].start
			);
			ts_blank_space(context, {
				start: implements_keyword_start,
				end: node.implements[node.implements.length - 1].end
			});
		}
		context.next();
	},
	MethodDefinition(node, context) {
		if (node.abstract) {
			ts_blank_space(context, { start: node.start, end: node.start + 'abstract'.length });
			return empty;
		}
		context.next();
	},
	VariableDeclaration(node, context) {
		if (node.declare) {
			ts_blank_space(context, node);
			return empty;
		}
		context.next();
	},
	TSModuleDeclaration(node, context) {
		if (!node.body) {
			ts_blank_space(context, node);
			return;
		}
		// namespaces can contain non-type nodes
		const cleaned = node.body.body.map((entry) => context.visit(entry));
		if (cleaned.some((entry) => entry !== empty)) {
			typescript_invalid_feature(node, 'namespaces with non-type nodes');
		}
		ts_blank_space(context, node);
	}
};

/**
 * Strips type-only constructs from TypeScript code and replaces them with blank spaces.
 * Errors on non-type constructs that are not supported in the REPL.
 *
 * This implementation closely follows the logic of https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/compiler/phases/1-parse/remove_typescript_nodes.js
 *
 * Used instead of`ts-blank-space` because the latter means we need to bundle all of TypeScript, which increases the worker bundles by 9x.
 */
export function strip_types(code: string): string {
	const ms = new MagicString(code);
	const ast = ParserWithTS.parse(code, {
		sourceType: 'module',
		ecmaVersion: 16,
		locations: true
	});

	walk(ast, { ms }, visitors);

	return ms.toString();
}
