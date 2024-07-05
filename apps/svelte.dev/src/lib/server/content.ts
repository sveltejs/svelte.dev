import { read } from '$app/server';
import { create_index } from '@sveltejs/site-kit/server/content';

// https://github.com/vitejs/vite/issues/17453
const rekey = (records: Record<string, string>, fn: (key: string) => string) => {
	const result: Record<string, string> = {};
	for (const key in records) {
		result[fn(key)] = records[key];
	}
	return result;
};

const svelte_docs = rekey(
	import.meta.glob<string>('../../../../../../svelte/documentation/docs/**/*.md', {
		eager: true,
		query: '?url',
		import: 'default'
	}),
	(key) => 'docs/svelte/' + key.slice('../../../../../../svelte/documentation/docs/'.length)
);

const documents = rekey(
	import.meta.glob<string>('../../../content/**/*.md', {
		eager: true,
		query: '?url',
		import: 'default'
	}),
	(key) => key.slice('../../../content/'.length)
);

const assets = rekey(
	import.meta.glob<string>('../../../content/**/+assets/**', {
		eager: true,
		query: '?url',
		import: 'default'
	}),
	(key) => key.slice('../../../content/'.length)
);

export const index = await create_index({ ...svelte_docs, ...documents }, assets, read);

const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

function format_date(date: string) {
	const [y, m, d] = date.split('-');
	return `${months[+m - 1]} ${+d} ${y}`;
}

export const blog_posts = index.blog.children
	.map((post) => {
		const authors: Array<{ name: string; url: string }> = [];

		if (post.metadata.author) {
			const names: string[] = post.metadata.author.split(/, ?/);
			const urls: string[] = post.metadata.authorURL.split(/, ?/);

			if (names.length !== urls.length) {
				throw new Error(`Mismatched authors and URLs in ${post.file}`);
			}

			authors.push(...names.map((name, i) => ({ name, url: urls[i] })));
		}

		const date = post.metadata.date ?? post.file.split('/').pop()!.slice(0, 10);

		return {
			title: post.metadata.title,
			date,
			date_formatted: format_date(date),
			description: post.metadata.description,
			draft: post.metadata.draft,
			authors,
			...post
		};
	})
	.sort((a, b) => (a.date < b.date ? 1 : -1));
