import type { Plugin } from '@rollup/browser';
import { stripTypes } from 'typestript';

const plugin: Plugin = {
	name: 'typescript-strip-types',
	transform: (code, id) => {
		const match = id.endsWith('.ts');
		if (!match) return;

		const { content, sourceMap } = stripTypes(code);

		console.log(content);

		return {
			code: content,
			map: sourceMap
		};
	}
};

export default plugin;
