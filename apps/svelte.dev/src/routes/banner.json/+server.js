import { json } from '@sveltejs/kit';
import { defineBanner } from '@sveltejs/site-kit/components';

export const prerender = true;

// This server route is used by all Svelte sites to load info about which banner to show.
// site-kit contains components/helpers to make fetching+displaying them easier.
export const GET = async () => {
	return json(
		defineBanner([
			{
				id: 'sveltehack2024',
				start: new Date('22 Oct, 2024 00:00:00 UTC'),
				end: new Date('10 January, 2025 23:59:59 UTC'),
				arrow: true,
				content: {
					lg: 'Celebrating the release of Svelte 5 with Svelte Hack 2024!',
					sm: 'Svelte Hack 2024'
				},
				href: 'https://hack.sveltesociety.dev/2024'
			}
		])
	);
};
