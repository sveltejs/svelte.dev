<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import type { BannerData } from '../types';
	import { browser } from '$app/env';
	import { Persisted } from '../state';

	let { banner }: { banner: BannerData } = $props();

	const key = 'sv:hidden-banners';
	const height = '4.2rem';

	const persisted = new Persisted<string>(key, '{}');
	const hidden = $derived(JSON.parse(persisted.current));
	const time = +new Date();

	let visible = $derived(
		browser && !hidden[banner.id] && time > +banner.start && time < +banner.end
	);

	$effect(() => {
		document.documentElement.style.setProperty('--sk-banner-height', visible ? height : '0px');
	});

	// a < in the id would end the inline script early
	const id = $derived(JSON.stringify(banner.id).replaceAll('<', '\\u003c'));

	// runs before first paint, since prerendered pages cannot know if the banner will show
	const reserve_space = $derived(
		`{
			let hidden = {};
			try {
				hidden = JSON.parse(localStorage.getItem(${JSON.stringify(key)}) ?? '{}');
			} catch {}
			const time = Date.now();
			if (!hidden[${id}] && time > ${+banner.start} && ${+banner.end} > time) {
				document.documentElement.style.setProperty('--sk-banner-height', '${height}');
			}
		}`
	);
</script>

<svelte:head>
	{@html `<script>${reserve_space}<` + `/script>`}
</svelte:head>

{#if visible}
	<div class="banner" transition:fade={{ duration: 400, easing: quintOut }}>
		<a href={banner.href}>
			{#if banner.content.lg}
				<span class="large">{banner.content.lg}</span>
			{/if}

			{#if banner.content.sm}
				<span class="small">{banner.content.sm}</span>
			{/if}

			{#if banner.arrow}
				<Icon name="arrow-right" size="1.2em" />
			{/if}
		</a>

		<button
			aria-label="Dismiss"
			class="raised primary"
			onclick={() => {
				persisted.current = JSON.stringify({
					...hidden,
					[banner.id]: true
				});
			}}
		>
			<Icon name="close" />
		</button>
	</div>
{/if}

<style>
	.banner {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 80;
		display: flex;
		justify-content: center;
		align-items: center;
		font: var(--sk-font-ui-medium);
		overflow-y: auto;
		width: 100%;
		height: var(--sk-banner-height);
		background: var(--sk-bg-accent);
		color: white;
		padding: 0 4rem;
	}

	button {
		position: absolute;
		right: var(--sk-page-padding-side);
		height: 100%;
		width: 3.2rem;
		height: 3.2rem;
	}

	a {
		position: relative;
		color: inherit;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: pre;
		text-align: center;
		line-height: 1;
	}

	span {
		position: relative;
		top: 0.05em;
	}

	.large {
		display: none;
	}

	.small {
		display: initial;
	}

	@media (min-width: 832px) {
		.banner {
			top: initial;
			bottom: 0;
		}

		button {
			right: 1rem;
		}

		.large {
			display: initial;
		}

		.small {
			display: none;
		}
	}
</style>
