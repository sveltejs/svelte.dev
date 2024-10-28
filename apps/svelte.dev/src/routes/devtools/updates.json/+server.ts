import { json } from '@sveltejs/kit';

export const prerender = true;

export async function GET({ fetch }) {
	const gh: Array<{ name: string }> = await fetch(
		'https://api.github.com/repos/sveltejs/svelte-devtools/tags'
	).then((r) => r.json());

	// v2.2.0 is the first version that has the Firefox extension
	const tags = gh.reverse().slice(gh.findIndex((t) => t.name === 'v2.2.0'));
	const base = 'https://github.com/sveltejs/svelte-devtools/releases/download';
	return json({
		addons: {
			'firefox-devtools@svelte.dev': {
				updates: tags.map(({ name: tag }) => {
					return {
						version: tag,
						update_link: `${base}/${tag}/svelte-devtools.xpi`,
						applications: requirements[tag] && { gecko: requirements[tag] }
					};
				})
			}
		}
	});
}

const requirements: Record<string, any> = {
	'v2.2.2': { strict_min_version: '121.0' }
};
