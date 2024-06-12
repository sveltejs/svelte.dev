import { extract_frontmatter, slugify } from '$lib/markdown/utils';
import type { Document } from '../../types';

export async function create_index(
	documents: Record<string, { default: string }>,
	assets: Record<string, { default: string }>,
	base: string,
	read: (asset: string) => Response
) {
	const content: Record<string, Document> = {};

	for (const key in documents) {
		if (key.includes('+assets')) continue;

		const file = key.slice(base.length + 1);
		const slug = file.replace(/(^|\/)\d+-/g, '$1').replace(/(\/index)?\.md$/, '');

		const text = await read(documents[key].default).text();
		const { metadata, body } = extract_frontmatter(text);

		if (!metadata.title) {
			throw new Error(`Missing title in ${slug} frontmatter`);
		}

		const sections = Array.from(body.matchAll(/^##\s+(.*)$/gm)).map((match) => {
			const title = match[1];
			const slug = slugify(title);

			return { slug, title };
		});

		content[slug] = {
			slug,
			file,
			metadata: metadata as { title: string; [key: string]: any },
			body,
			sections,
			children: []
		};
	}

	for (const slug in content) {
		const parts = slug.split('/');
		parts.pop();

		if (parts.length > 0) {
			const parent = content[parts.join('/')];

			if (parent) {
				parent.children.push(content[slug]);
			}
		}
	}

	for (const key in assets) {
		const path = key.slice(base.length + 1);
		const slug = path.slice(0, path.indexOf('+assets') - 1).replace(/(^|\/)\d+-/g, '$1');
		const file = path.slice(path.indexOf('+assets') + 8);

		const document = content[slug];

		(document.assets ??= {})[file] = assets[key].default;
	}

	return content;
}
