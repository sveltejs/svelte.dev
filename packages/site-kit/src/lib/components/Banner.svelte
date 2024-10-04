<script lang="ts">
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';

	interface Props {
		/** Whether to show an arrow at the end */
		arrow?: boolean;
		/** Link to the event. It must be an absolute path (https://svelte.dev/blog/runes instead of /blog/runes) */
		href: string;
		content: {
			lg?: string;
			sm?: string;
		};
		close?: () => void;
	}

	let { arrow = false, href, content }: Props = $props();

	let show = $state(false);
	onMount(() => {
		setTimeout(() => {
			show = true;
		}, 300);
	});
</script>

{#if show}
	<div class="banner-bottom" transition:fade={{ duration: 400, easing: quintOut }}>
		<div class="main-area">
			<a {href}>
				{#if content.lg}
					<span class="lg">{content.lg}</span>
				{/if}

				{#if content.sm}
					<span class="sm">{content.sm}</span>
				{/if}
			</a>

			{#if arrow}
				<Icon name="arrow-right" size="1.2em" />
			{/if}
		</div>

		<button class="close-button" onclick={() => close?.()}>
			<Icon name="close" />
		</button>
	</div>
{/if}

<style>
	.banner-bottom {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 80;

		display: flex;
		justify-content: center;
		align-items: center;

		overflow-y: auto;

		width: 100%;
		height: max-content;
	}

	.banner-bottom {
		text-align: center;
		background: var(--sk-theme-1-variant);
		color: white;
		padding: 8px;
	}

	.banner-bottom :global(a) {
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
		.banner-bottom {
			bottom: initial;
			top: 0;
		}

		.main-area :global(svg) {
			display: none;
		}

		a .lg {
			display: none;
		}

		a .sm {
			display: initial;
		}
	}
</style>
