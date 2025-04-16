import type { Plugin } from '@rollup/browser';
import { parse } from 'acorn';
import type { Node } from 'estree';
import { walk } from 'zimmerframe';

const require = `function require(id) {
	if (id in __repl_lookup) return __repl_lookup[id];
	throw new Error(\`Cannot require modules dynamically (\${id})\`);
}`;

const plugin: Plugin = {
	name: 'commonjs',

	transform: (code, id) => {
		if (!/\b(require|module|exports)\b/.test(code)) return;

		try {
			const ast = parse(code, {
				ecmaVersion: 'latest'
			});

			const requires: string[] = [];
			const exports: string[] = [];

			walk(ast as Node, null, {
				CallExpression: (node, context) => {
					if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
						if (node.arguments.length !== 1) return;
						const arg = node.arguments[0];
						if (arg.type !== 'Literal' || typeof arg.value !== 'string') return;

						requires.push(arg.value);
					}

					context.next();
				},
				AssignmentExpression: (node, context) => {
					if (node.operator !== '=') return;
					if (node.left.type !== 'MemberExpression') return;
					if (node.left.object.type !== 'Identifier' || node.left.object.name !== 'exports') return;
					if (node.left.computed || node.left.property.type !== 'Identifier') return;

					exports.push(
						`export const ${node.left.property.name} = module.exports.${node.left.property.name};`
					);

					context.next();
				}
			});

			const imports = requires.map((id, i) => `import __repl_${i} from '${id}';`).join('\n');
			const lookup = `const __repl_lookup = { ${requires
				.map((id, i) => `'${id}': __repl_${i}`)
				.join(', ')} };`;

			const transformed = [
				imports,
				lookup,
				require,
				`const exports = {}; const module = { exports };`,
				code,
				`export default module.exports;`,
				exports.join('\n')
			].join('\n\n');

			return {
				code: transformed,
				map: null
			};
		} catch (err) {
			return null;
		}
	}
};

export default plugin;
