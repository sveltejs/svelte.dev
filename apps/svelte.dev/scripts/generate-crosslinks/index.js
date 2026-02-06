// @ts-check
import fs from 'node:fs';
import { extract_frontmatter } from '../../../../packages/site-kit/src/lib/markdown/utils.ts';

/** @type {Record<string, string[][]>} */
const lookup = {};

/**
 * Remove numeric prefix and `.md` suffix
 * @param {string} basename
 */
function clean(basename) {
	return basename.replace(/^\d\d-/, '').replace(/\.md$/, '');
}

/**
 * Convert a filename inside `content` to a path on svelte.dev
 * @param {string} filename
 */
function get_page(filename) {
	const parts = filename.split('/');

	switch (parts[1]) {
		case 'docs':
		case 'tutorial':
			return [parts[1], clean(parts[2]), clean(parts[4])];

		default:
			throw new Error(`Not handled ${filename}`);
	}
}

for (const filename of fs.globSync('content/**/*.md')) {
	const content = fs.readFileSync(filename, 'utf-8');
	const { metadata } = extract_frontmatter(content);

	if (!metadata.tags) continue;

	const tags = metadata.tags.split(',').map((tag) => tag.trim());
	const page = get_page(filename);

	for (const tag of tags) {
		(lookup[tag] ??= []).push(page);
	}
}

fs.writeFileSync(
	`src/lib/server/generated/crosslinks.json`,
	JSON.stringify(lookup, null, '\t') + '\n'
);
