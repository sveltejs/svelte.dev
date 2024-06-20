<script context="module">
	type BannerScope = 'svelte.dev' | 'kit.svelte.dev' | 'learn.svelte.dev';
	interface BannerData {
		id: string;
		start: number;
		end: number;
		arrow: boolean;
		href: string;
		content: {
			lg?: string;
			sm?: string;
		};
		scope?: BannerScope[];
	}
	type BannerDataInput = Array<Omit<BannerData, 'start' | 'end'> & { start: Date; end?: Date }>;

	/**
	 * Only to be used on non svelte.dev sites. Shouldn't be used inside svelte.dev codebase itself
	 */
	export async function fetchBanner(
		scope: BannerScope = 'svelte.dev',
		fetch: RequestEvent['fetch']
	): Promise<BannerData[]> {
		if (scope === 'svelte.dev') {
			const data = (await fetch('/banner.json').then((r) => r.json())) as BannerData[];

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

		return ((await req.json()) as BannerData[]).filter(
			(banner) => !banner.scope || banner.scope?.includes(scope)
		);
	}

	export function defineBanner(data: BannerDataInput): BannerData[] {
		return data.map((v) => ({
			...v,
			start: +v.start,
			end: v.end ? +v.end : +new Date('2023-12-01')
		}));
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { persisted } from 'svelte-persisted-store';
	import Banner from './Banner.svelte';
	import type { RequestEvent } from '@sveltejs/kit';

	let { data }: { data: BannerData[] } = $props();

	const preferences = persisted<Record<string, boolean>>('svelte:banner-preferences', {});
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
