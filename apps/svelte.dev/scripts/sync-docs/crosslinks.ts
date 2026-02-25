import fs from 'node:fs';
import { extract_frontmatter } from '../../../../packages/site-kit/src/lib/markdown/utils.ts';
import type { RelatedLink } from '../../src/lib/types';

export function generate_crosslinks() {
	const crosslinked: RelatedLink[] = [];

	const cached_frontmatter: Record<string, Record<string, string>> = {};

	/**
	 * Remove numeric prefix and `.md` suffix
	 */
	function clean(basename: string) {
		return basename.replace(/^\d\d-/, '').replace(/\.md$/, '');
	}

	function get_frontmatter(filename: string) {
		return (cached_frontmatter[filename] ??= extract_frontmatter(
			fs.readFileSync(filename, 'utf-8')
		).metadata);
	}

	/**
	 * Convert a filename inside `content` to a path on svelte.dev
	 */
	function get_path(filename: string): string {
		const parts = filename.split('/');

		switch (parts[1]) {
			case 'docs':
			case 'tutorial':
				return `/${parts[1]}/${clean(parts[2])}/${clean(parts[4])}`;

			default:
				throw new Error(`Not handled ${filename}`);
		}
	}

	function get_breadcrumbs(filename: string) {
		const breadcrumbs = [get_frontmatter(filename).title];

		let parts = filename.split('/');
		while (parts.length > 1) {
			parts.pop();

			const index = [...parts, 'index.md'].join('/');
			if (index === filename) continue;

			if (fs.existsSync(index)) {
				breadcrumbs.unshift(get_frontmatter(index).title);
			}
		}

		return breadcrumbs;
	}

	const by_tag: Record<string, RelatedLink[]> = {};

	for (const filename of fs.globSync('content/**/*.md')) {
		const metadata = get_frontmatter(filename);
		if (!metadata.tags) continue;

		const tags = metadata.tags.split(',').map((tag) => tag.trim());
		const path = get_path(filename);
		const breadcrumbs = get_breadcrumbs(filename);

		const page = { path, breadcrumbs, tags };
		crosslinked.push(page);

		for (const tag of tags) {
			(by_tag[tag] ??= []).push(page);
		}
	}

	const only_used_once = Object.keys(by_tag).filter((tag) => by_tag[tag].length === 1);

	if (only_used_once.length > 0) {
		console.error(
			`The following tags are only used once:${only_used_once.map((t) => `\n  - ${t}`).join('')}`
		);
	}

	fs.writeFileSync(
		`src/lib/server/generated/crosslinked.json`,
		JSON.stringify(crosslinked, null, '\t') + '\n'
	);
}
