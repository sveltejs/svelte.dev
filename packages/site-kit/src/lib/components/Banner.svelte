<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { persisted } from 'svelte-persisted-store';
	import Icon from './Icon.svelte';
	import type { BannerData } from '../types';
	import { browser } from '$app/environment';

	let { banner }: { banner: BannerData } = $props();

	const hidden = persisted<Record<string, boolean>>('svelte:hidden-banners', {});
	const time = +new Date();

	let visible = $derived(
		browser && !$hidden[banner.id] && time > +banner.start && time < +banner.end
	);

	$effect(() => {
		document.documentElement.style.setProperty('--sk-banner-height', visible ? '4.2rem' : '0px');
	});
</script>

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
				$hidden[banner.id] = true;
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
		background: var(--sk-theme-1-variant);
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

	@media (min-width: 800px) {
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
