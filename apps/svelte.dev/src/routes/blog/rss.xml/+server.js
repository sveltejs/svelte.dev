import { index } from '$lib/server/content';
import { render_content } from '$lib/server/renderer';

export const prerender = false; // TODO

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');

/** @param {string} str */
function formatPubdate(str) {
	const [y, m, d] = str.split('-');
	return `${d} ${months[+m]} ${y} 12:00 +0000`;
}

/** @param {string} html */
function escapeHTML(html) {
	/** @type {{ [key: string]: string }} */
	const chars = {
		'"': 'quot',
		"'": '#39',
		'&': 'amp',
		'<': 'lt',
		'>': 'gt'
	};

	return html.replace(/["'&<>]/g, (c) => `&${chars[c]};`);
}

/** @param {import('@sveltejs/site-kit').Document[]} posts */
const get_rss = async (posts) => {
	const renderedPosts = await Promise.all(
		posts
			.filter((post) => !post.metadata.draft)
			.map(
				async (post) => `
		<item>
			<title>${escapeHTML(post.metadata.title)}</title>
			<link>https://svelte.dev/${post.slug}</link>
			<author>${escapeHTML(post.metadata.author)}</author>
			<description>${escapeHTML(await render_content(post.file, post.body))}</description>
			<pubDate>${formatPubdate(/** @type {string} */ (post.file.split('/').pop()).slice(0, 10))}</pubDate>
		</item>
	`
			)
	);

	return `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.dev/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.dev/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.dev/blog</link>
	</image>
			${renderedPosts.join('')}
</channel>

</rss>
`
		.replace(/>[^\S]+/gm, '>')
		.replace(/[^\S]+</gm, '<')
		.trim();
};

export async function GET() {
	return new Response(await get_rss(index.blog.children), {
		headers: {
			'Cache-Control': `max-age=${30 * 60 * 1e3}`,
			'Content-Type': 'application/rss+xml'
		}
	});
}
