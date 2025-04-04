import type { Plugin } from '@rollup/browser';
import { stripTypes } from 'typestript';

const plugin: Plugin = {
	name: 'typescript-strip-types',
	transform: (code, id) => {
		if (!id.endsWith('.ts')) return;

		const s = stripTypes(code);

		return {
			code: s.toString(),
			map: s.generateMap({ hires: true })
		};
	}
};

export default plugin;
