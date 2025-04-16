import type { Plugin } from '@rollup/browser';
import tsBlankSpace from 'ts-blank-space';

const plugin: Plugin = {
	name: 'typescript-strip-types',
	transform: (code, id) => {
		const match = id.endsWith('.ts');
		if (!match) return;

		return {
			code: tsBlankSpace(code)
		};
	}
};

export default plugin;
