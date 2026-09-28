export type DownloadFile = { path: string; data: string | number[] };

const COMPILER_OPTIONS = 'compilerOptions: {';

export function template_path(tailwind: boolean): string {
	return tailwind ? '/svelte-tailwind-template.json' : '/svelte-template.json';
}

export function project_files(
	template: DownloadFile[],
	components: { name: string; contents: string }[],
	imports: string[],
	tailwind: boolean,
	async_mode = false
): DownloadFile[] {
	const files = template.map(({ path, data }) => ({ path, data }));

	// scripts/get_svelte_template.js guarantees that these files exist
	const text_file = (path: string) =>
		files.find((file) => file.path === path) as { path: string; data: string };

	if (async_mode) {
		const vite_config = text_file('vite.config.ts');
		vite_config.data = vite_config.data.replace(
			COMPILER_OPTIONS,
			`${COMPILER_OPTIONS}\n\t\t\t\texperimental: { async: true },`
		);
	}

	if (imports.length > 0) {
		const pkg_file = text_file('package.json');
		const pkg = JSON.parse(pkg_file.data);
		const dev_dependencies = (pkg.devDependencies ??= {});
		for (const mod of imports) {
			const match = /^(@[^/]+\/)?[^@/]+/.exec(mod)!;
			dev_dependencies[match[0]] = 'latest';
		}
		pkg_file.data = JSON.stringify(pkg, null, '  ');
	}

	files.push(
		...components.map((component) => ({
			path: `src/routes/${component.name}`,
			data: component.contents
		}))
	);

	if (tailwind) {
		const styles = components.filter(
			({ name, contents }) =>
				name.endsWith('.css') && /@(theme|utility|custom-variant)\b/.test(contents)
		);
		if (styles.length > 0) {
			const stylesheet = text_file('src/routes/layout.css');
			// Tailwind needs custom directives in the stylesheet that imports its base CSS.
			stylesheet.data += styles.map(({ name }) => `\n@import './${name}';`).join('');
		}
	}

	return files;
}
