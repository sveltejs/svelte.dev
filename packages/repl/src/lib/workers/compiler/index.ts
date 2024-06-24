import type { CompilerCommand, CompilerInput, CompilerOutput, MigrateInput } from '../workers';

self.window = self; //TODO: still need?: egregious hack to get magic-string to work in a worker

let fulfil_ready: (arg?: never) => void;
const ready = new Promise((f) => {
	fulfil_ready = f;
});

self.addEventListener('message', async (event: MessageEvent<CompilerCommand>) => {
	switch (event.data.type) {
		case 'init':
			const { svelte_url } = event.data;

			const { version } = await fetch(`${svelte_url}/package.json`)
				.then((r) => r.json())
				.catch(() => ({ version: 'experimental' }));

			const compiler = await fetch(`${svelte_url}/compiler/index.js`).then((r) => r.text());
			(0, eval)(compiler + '\n//# sourceURL=compiler/index.js@' + version);

			fulfil_ready();
			break;

		case 'compile':
			await ready;

			postMessage({
				id: event.data.id,
				result: compile(event.data.payload)
			});

			break;

		case 'migrate':
			await ready;

			postMessage({
				id: event.data.id,
				result: migrate(event.data.payload)
			});

			break;
	}
});

const common_options = {
	dev: false,
	css: false
};

function compile({ source, options, return_ast }: CompilerInput): CompilerOutput {
	try {
		const css = `/* Select a component to see compiled CSS */`;

		if (options.filename.endsWith('.svelte')) {
			const compiled = svelte.compile(source, {
				filename: options.filename,
				generate: options.generate,
				dev: options.dev,
				discloseVersion: false // less visual noise in the output tab
			});

			const { js, css, warnings, metadata } = compiled;

			const ast = return_ast ? svelte.parse(source, { modern: true }) : undefined;

			return {
				js: js.code,
				css: css?.code || `/* Add a <sty` + `le> tag to see compiled CSS */`,
				error: null,
				warnings,
				metadata,
				ast
			};
		} else if (options.filename.endsWith('.svelte.js')) {
			const compiled = svelte.compileModule(source, {
				filename: options.filename,
				generate: options.generate,
				dev: options.dev
			});

			if (compiled) {
				return {
					js: compiled.js.code,
					css,
					error: null,
					warnings: compiled.warnings,
					metadata: compiled.metadata
				};
			}
		}

		return {
			js: `// Select a component, or a '.svelte.js' module that uses runes, to see compiled output`,
			css,
			error: null,
			warnings: [],
			metadata: null
		};
	} catch (err) {
		// @ts-ignore
		let message = `/*\nError compiling ${err.filename ?? 'component'}:\n${err.message}\n*/`;

		return {
			js: message,
			css: message,
			error: { ...err },
			warnings: [],
			metadata: null
		};
	}
}

function migrate({ source }: MigrateInput) {
	try {
		const result = svelte.migrate(source);

		return { result };
	} catch (err) {
		// @ts-ignore
		let message = `/*\nError migrating ${err.filename ?? 'component'}:\n${err.message}\n*/`;

		return {
			result: { code: source },
			error: message
		};
	}
}
