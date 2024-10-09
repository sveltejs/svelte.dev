import { index, docs as _docs, examples } from '$lib/server/content';
import { json } from '@sveltejs/kit';
import { markedTransform, normalizeSlugify, removeMarkdown } from '@sveltejs/site-kit/markdown';
import type { Block } from '@sveltejs/site-kit/search';
import { get_slug } from '../tutorial/[...slug]/content.server';

export const prerender = true;

export async function GET() {
	return json({
		blocks: await content()
	});
}

function get_href(parts: string[]) {
	return parts.length > 1 ? `/${parts[0]}#${parts.at(-1)}` : `/${parts[0]}`;
}

async function content() {
	const blocks: Block[] = [];
	const docs = Object.values(_docs.pages).concat(
		index.tutorial.children.flatMap((part) =>
			part.children.flatMap((chapter) =>
				chapter.children.map((exercise) => ({
					...exercise,
					slug: get_slug(part, exercise)
				}))
			)
		)
	);

	for (const document of docs) {
		const { slug, body, metadata } = document;
		const breadcrumbs = document.breadcrumbs.map((x) => removeMarkdown(x.title));

		const sections = body.trim().split(/^## /m);
		const intro = sections?.shift()?.trim()!;
		const rank = +metadata.rank;

		blocks.push({
			breadcrumbs: [...breadcrumbs, removeMarkdown(metadata.title ?? '')],
			href: get_href([slug]),
			content: await plaintext(intro),
			rank
		});

		for (const section of sections) {
			const lines = section.split('\n');
			const h2 = lines.shift();
			if (!h2) {
				console.warn('Could not find expected heading h2');
				continue;
			}

			const content = lines.join('\n');
			const subsections = content.trim().split('## ');
			const intro = subsections?.shift()?.trim();
			if (intro) {
				blocks.push({
					breadcrumbs: [...breadcrumbs, removeMarkdown(metadata.title), removeMarkdown(h2)],
					href: get_href([slug, normalizeSlugify(h2)]),
					content: await plaintext(intro),
					rank
				});
			}

			for (const subsection of subsections) {
				const lines = subsection.split('\n');
				const h3 = lines.shift();
				if (!h3) {
					console.warn('Could not find expected heading h3');
					continue;
				}

				blocks.push({
					breadcrumbs: [
						...breadcrumbs,
						removeMarkdown(metadata.title),
						removeMarkdown(h2),
						removeMarkdown(h3)
					],
					href: get_href([slug, normalizeSlugify(h2) + '-' + normalizeSlugify(h3)]),
					content: await plaintext(lines.join('\n').trim()),
					rank
				});
			}
		}
	}

	for (const section of examples) {
		for (const example of section.children) {
			blocks.push({
				breadcrumbs: ['Examples', section.metadata.title, example.metadata.title],
				href: `/playground/${example.slug.split('/').pop()}`,
				content: '',
				rank: 10
			});
		}
	}

	return blocks;
}

async function plaintext(markdown: string) {
	const block = ({ text }: any) => `${text}\n`;

	const inline = ({ text }: any) => text;

	return (
		await markedTransform(markdown, {
			code: ({ text }) => {
				const raw = text.split('// ---cut---\n').pop() ?? '';

				return raw
					.replace(/^\/\/ @noErrors.*$/gm, ' ')
					.replace(/^\/\/ @errors.+$/gm, ' ')
					.replace(/^\/\/\/ file:.+$/gm, ' ');
			},
			blockquote: block,
			html: () => '\n',
			heading: ({ text }) => `${text}\n`,
			hr: () => '',
			list: block,
			listitem: block,
			checkbox: block,
			paragraph({ tokens }) {
				return this.parser!.parseInline(tokens);
			},
			table: block,
			tablerow: block,
			tablecell: ({ text }) => {
				return text + ' ';
			},
			strong: inline,
			em: inline,
			codespan: inline,
			br: () => '',
			del: inline,
			link: inline,
			image: inline,
			text: inline
		})
	)
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#(\d+);/g, (match, code) => {
			return String.fromCharCode(code);
		})
		.trim();
}
