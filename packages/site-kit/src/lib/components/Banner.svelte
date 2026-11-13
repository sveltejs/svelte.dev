<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import type { BannerData } from '../types';
	import { browser } from '$app/env';
	import { Persisted } from '../state';

	let { banner }: { banner: BannerData } = $props();

	const persisted = new Persisted<string>('sv:hidden-banners', '{}');
	const hidden = $derived(JSON.parse(persisted.current));
	const time = +new Date();

	let visible = $derived(
		browser && !hidden[banner.id] && time > +banner.start && time < +banner.end
	);

	// app.html adds the class before the first paint, so the space is there before the banner is
	$effect(() => {
		document.documentElement.classList.toggle('banner-shown', visible);
	});
</script>

<svelte:head>
	<meta name="sv:banner" content={banner.id} data-start={+banner.start} data-end={+banner.end} />
</svelte:head>

{#if visible}
	<div class="banner" data-banner transition:fade={{ duration: 250, easing: quintOut }}>
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
	:global(:root.banner-shown) {
		--sk-banner-height: 4.2rem;
	}

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
		height: 4.2rem;
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
