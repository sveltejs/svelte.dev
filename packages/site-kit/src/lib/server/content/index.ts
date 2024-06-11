import { extract_frontmatter, slugify } from '$lib/markdown/utils';
import type { Page } from '../../types';

export async function create_index(
	modules: Record<string, { default: string }>,
	read: (asset: string) => Response
) {
	const content: Record<string, Page> = {};

	for (const key in modules) {
		const slug = key
			.slice('../content/'.length, -'.md'.length)
			.replace(/(^|\/)\d+-/g, '$1')
			.replace(/\/index$/, '');

		const text = await read(modules[key].default).text();
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
			title: metadata.title,
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

	return content;
}
