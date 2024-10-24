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
		document.documentElement.style.setProperty('--sk-banner-height', visible ? '41.9px' : '0px');
	});
</script>

{#if visible}
	<div class="banner" transition:fade={{ duration: 400, easing: quintOut }}>
		<div class="main-area">
			<a href={banner.href}>
				{#if banner.content.lg}
					<span class="lg">{banner.content.lg}</span>
				{/if}

				{#if banner.content.sm}
					<span class="sm">{banner.content.sm}</span>
				{/if}
			</a>

			{#if banner.arrow}
				<Icon name="arrow-right" size="1.2em" />
			{/if}
		</div>

		<button
			class="close-button"
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
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 80;

		display: flex;
		justify-content: center;
		align-items: center;

		font: var(--sk-font-ui-medium);

		overflow-y: auto;

		width: 100%;
		height: max-content;
	}

	.banner {
		text-align: center;
		background: var(--sk-theme-1-variant);
		color: white;
		padding: 8px;
	}

	.banner :global(a) {
		color: hsl(0, 0%, 99%);
	}

	button {
		position: absolute;
		top: 0;
		right: 1rem;

		display: flex;
		align-items: center;

		height: 100%;
	}

	.main-area {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.main-area :global(svg) {
		transition: transform 0.2s var(--quint-out);
	}

	.main-area:hover :global(svg) {
		transform: translateX(40%);
	}

	div :global(a[href]) {
		text-decoration: none;
		padding: 0;
	}

	a .lg {
		display: initial;
	}

	a .sm {
		display: none;
	}

	@media screen and (max-width: 799px) {
		.banner {
			bottom: initial;
			top: 0;
		}

		a .lg {
			display: none;
		}

		a .sm {
			display: initial;
		}
	}
</style>
