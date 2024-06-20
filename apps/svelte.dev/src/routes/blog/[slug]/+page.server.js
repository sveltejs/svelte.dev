import { error } from '@sveltejs/kit';
import { index } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';

export const prerender = true;

export async function load({ params }) {
	const post = index[`blog/${params.slug}`];

	if (!post) error(404);

	// forgive me — terrible hack necessary to get diffs looking sensible
	// on the `runes` blog post
	post.body = post.body.replace(/(    )+/gm, (match) => '  '.repeat(match.length / 4));

	/** @type {Array<{ name: string, url: string }>} */
	const authors = [];

	if (post.metadata.author) {
		const names = /** @type {string} */ (post.metadata.author).split(/, ?/);
		const urls = /** @type {string} */ (post.metadata.authorURL).split(/, ?/);

		if (names.length !== urls.length) {
			throw new Error(`Mismatched authors and URLs in ${post.file}`);
		}

		authors.push(...names.map((name, i) => ({ name, url: urls[i] })));
	}

	const basename = /** @type {string} */ (post.file.split('/').pop());
	const date = basename.slice(0, 10);

	return {
		title: post.metadata.title,
		description: post.metadata.description,
		path: `/${post.slug}`,
		date,
		date_formatted: format_date(date),
		body: await render_content(post.file, post.body),
		authors,
		sections: post.sections
	};
}

/** @param {string} date */
function format_date(date) {
	const [y, m, d] = date.split('-');
	return `${months[+m - 1]} ${+d} ${y}`;
}

const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
