import { extract_frontmatter, slugify } from '../../markdown/utils';
import type { Document } from '../../types';

export async function create_index(
	documents: Record<string, string>,
	assets: Record<string, string>,
	base: string,
	read: (asset: string) => Response
) {
	const content: Record<string, Document> = {};

	for (const key in documents) {
		if (key.includes('+assets') || key.endsWith('/_generated.md')) continue;

		const file = key.slice(base.length + 1);
		const slug = file.replace(/(^|\/)\d+-/g, '$1').replace(/(\/index)?\.md$/, '');

		const text = await read(documents[key]).text();
		let { metadata, body } = extract_frontmatter(text);

		if (!metadata.title) {
			throw new Error(`Missing title in ${slug} frontmatter`);
		}

		// Check if there's a generated file inside the same folder
		// which contains content to include in this document.
		const generated = documents[key.substring(0, key.lastIndexOf('/')) + '/_generated.md'];

		if (generated) {
			const generated_text = await read(generated).text();

			body = body.replaceAll(/<!-- @include (.+?) -->/g, (_, name) => {
				const include_start = `<!-- @include_start ${name} -->`;
				const snippet = generated_text.slice(
					generated_text.indexOf(include_start) + include_start.length,
					generated_text.indexOf(`<!-- @include_end ${name} -->`)
				);

				if (!snippet) {
					throw new Error(`Could not find include for ${name}`);
				}

				return snippet;
			});
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

		(document.assets ??= {})[file] = assets[key];
	}

	return content;
}
