export type DownloadFile = { path: string; data: string | number[] };

export function template_path(tailwind: boolean): string {
	return tailwind ? '/svelte-tailwind-template.json' : '/svelte-template.json';
}

export function project_files(
	template: DownloadFile[],
	components: { name: string; contents: string }[],
	imports: string[],
	tailwind: boolean
): DownloadFile[] {
	const files = template.map(({ path, data }) => ({ path, data }));

	if (imports.length > 0) {
		const pkg_file = files.find(({ path }) => path === 'package.json');
		if (!pkg_file || typeof pkg_file.data !== 'string') {
			throw new Error('The playground download template is missing package.json');
		}
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
			const stylesheet = files.find(({ path }) => path === 'src/routes/layout.css');
			if (!stylesheet || typeof stylesheet.data !== 'string') {
				throw new Error('The Tailwind download template is missing its stylesheet');
			}
			// Tailwind needs custom directives in the stylesheet that imports its base CSS.
			stylesheet.data += styles.map(({ name }) => `\n@import './${name}';`).join('');
		}
	}

	return files;
}
