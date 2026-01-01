import { extract_frontmatter, is_in_code_block, slugify, smart_quotes } from '../../markdown/utils';
import type { Document } from '../../types';

export async function create_index(
	documents: Record<string, string>,
	assets: Record<string, string>,
	documents_assets: Record<string, string>,
	base: string,
	read: (asset: string) => Response
): Promise<Record<string, Document>> {
	const content: Record<string, Document> = {};

	const roots: Document[] = [];

	for (const key in documents) {
		if (key.includes('+assets')) continue;

		const file = key.slice(base.length + 1);
		const slug = file.replace(/(^|\/)[\d-]+-/g, '$1').replace(/(\/index)?\.md$/, '');

		const text = await read(documents[key]).text();
		let { metadata, body } = extract_frontmatter(text);

		if (!metadata.title) {
			throw new Error(`Missing title in ${slug} frontmatter`);
		}

		metadata.title = smart_quotes(metadata.title);
		if (metadata.description)
			metadata.description = smart_quotes(metadata.description).replace(
				/`(.+?)`/g,
				'<code>$1</code>'
			);

		const sections = Array.from(body.matchAll(/^##\s+(.*)$/gm)).reduce(
			(arr, match) => {
				if (is_in_code_block(body, match.index || 0)) return arr;
				const title = smart_quotes(match[1])
					// replace < and > inside code spans
					.replace(/`(.+?)`/g, (_, contents) =>
						contents.replace(/</g, '&lt;').replace(/>/g, '&gt;')
					)
					// turn e.g. `class:_name_` into `class:<em>name</em>`
					.replace(/_(.+)_/g, (_, contents) => `<em>${contents}</em>`);

				const slug = slugify(title);

				arr.push({ slug, title });
				return arr;
			},
			[] as Array<{ slug: string; title: string }>
		);

		content[slug] = {
			slug,
			file,
			metadata: metadata as { title: string; [key: string]: any },
			breadcrumbs: [],
			body,
			sections,
			children: [],
			prev: null,
			next: null
		};
	}

	for (const slug in content) {
		if (slug.includes('xx-')) continue;

		const parts = slug.split('/');
		parts.pop();

		const document = content[slug];

		if (parts.length === 0) {
			roots.push(document);
		} else {
			let parent = content[parts.join('/')];

			if (parent) {
				parent.children.push(document);

				while (parts.length) {
					document.breadcrumbs.unshift({ title: parent.metadata.title });
					parts.pop();
					parent = content[parts.join('/')];
				}
			} else {
				roots.push(document);
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

	for (const key in documents_assets) {
		const path = key.slice(base.length + 1);
		const slug = path.slice(0, path.indexOf('+assets') - 1).replace(/(^|\/)\d+-/g, '$1');
		const file = path.slice(path.indexOf('+assets') + 8);
		const document = content[slug];

		(document.assets ??= {})[file] = documents_assets[key];
	}

	let prev: Document | null = null;

	for (const document of roots) {
		prev = create_links(document, prev);
	}

	return content;
}

function create_links(document: Document, prev: Document | null): Document | null {
	if (document.body) {
		link(prev, document);
		prev = document;
	}

	for (let i = 0; i < document.children.length; i += 1) {
		prev = create_links(document.children[i], prev);
	}

	return prev;
}

function link(prev: Document | null, next: Document | null) {
	if (prev) prev.next = next && { slug: next.slug, title: next.metadata.title };
	if (next) next.prev = prev && { slug: prev.slug, title: prev.metadata.title };
}
