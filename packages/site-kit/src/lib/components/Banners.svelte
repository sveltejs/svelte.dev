<script context="module">
	/**
	 * @typedef {'svelte.dev' | 'kit.svelte.dev' | 'learn.svelte.dev'} BannerScope
	 *
	 * @typedef {{
	 * id: string;
	 * start: number;
	 * end: number;
	 * arrow: boolean;
	 * href: string;
	 * content: {
	 *   lg?: string;
	 *   sm?: string;
	 * };
	 * scope?: BannerScope[];
	 * }[]} BannerData
	 *
	 * @typedef {(Omit<BannerData[0], 'start' | 'end'> & { start: Date, end?: Date })[]} BannerDataInput
	 */

	/**
	 * Only to be used on non svelte.dev sites. Shouldn't be used inside svelte.dev codebase itself
	 * @param {BannerScope} scope
	 * @param {import('@sveltejs/kit').RequestEvent['fetch']} fetch
	 * @returns {Promise<BannerData>}
	 */
	export async function fetchBanner(scope = 'svelte.dev', fetch) {
		if (scope === 'svelte.dev') {
			const data = /** @type {BannerData} */ (await fetch('/banner.json').then((r) => r.json()));

			// Find out if any time overlap will happen in any banner.
			// If so, throw an error.
			// This is to prevent showing 2 banners at once at any point of time.
			for (const banner of data) {
				for (const other of data) {
					if (banner.id === other.id) continue;
					if (banner.start < other.end && banner.end > other.start) {
						throw new Error(
							`svelte.dev/banner.json: Banner with ID ${banner.id} and ${other.id} are overlapping.`
						);
					}
				}
			}

			return data;
		}

		const req = await fetch('https://svelte.dev/banner.json');
		if (!req.ok) {
			console.warn('There was an error fetching the banner data. Check svelte.dev/banner.json');
			return [];
		}

		return /** @type {BannerData} */ (await req.json()).filter(
			(banner) => !banner.scope || banner.scope?.includes(scope)
		);
	}

	/**
	 * @param {BannerDataInput} data
	 * @returns {BannerData}
	 */
	export function defineBanner(data) {
		return data.map((v) => ({
			...v,
			start: +v.start,
			end: v.end ? +v.end : +new Date('2023-12-01')
		}));
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { persisted } from 'svelte-persisted-store';
	import Banner from './Banner.svelte';

	/** @type {{data: BannerData}} */
	let { data } = $props();

	const preferences = persisted(
		'svelte:banner-preferences',
		/** @type {Record<string, boolean>} */ ({})
	);

	const time = +new Date();

	let showing = $derived(
		data.filter(({ id, start, end }) => $preferences[id] && time > start && time < end)
	);

	$effect(() => {
		document.documentElement.style.setProperty(
			'--sk-banner-bottom-height',
			showing.length ? '41.9px' : '0px'
		);
	});

	onMount(() => {
		for (const { id } of data) {
			$preferences[id] ??= true;
		}
	});
</script>

{#each showing as { content, href, id, arrow }}
	<Banner {arrow} {href} on:close={() => ($preferences[id] = false)} {content} />
{/each}
