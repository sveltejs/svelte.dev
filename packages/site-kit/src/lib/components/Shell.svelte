<!-- @component
The main shell of the application. It provides a slot for the top navigation, the main content, and the bottom banner.
-->

<script lang="ts">
	import { navigating } from '$app/stores';
	import { overlay_open } from '../stores';
	import PreloadingIndicator from '../nav/PreloadingIndicator.svelte';
	import SkipLink from '../nav/SkipLink.svelte';
	import '../styles/index.css';
	import Icons from './Icons.svelte';
	import type { Snippet } from 'svelte';

	let {
		nav_visible = true,
		top_nav,
		children,
		banner_bottom
	}: {
		nav_visible?: boolean;
		top_nav?: Snippet;
		children?: Snippet;
		banner_bottom?: Snippet;
	} = $props();
</script>

<Icons />

{#if $navigating}
	<PreloadingIndicator />
{/if}

{#if nav_visible}
	<SkipLink href="#main" />

	{@render top_nav?.()}
{/if}

<div class="modal-overlay" class:visible={$overlay_open} aria-hidden="true"></div>

<main id="main">
	{@render children?.()}
</main>

<div class="banner-bottom">
	{@render banner_bottom?.()}
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;

		opacity: 0;
		pointer-events: none;

		width: 100%;
		height: 100%;
		height: 100dvh;

		background: var(--sk-back-1);
		transition: opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.modal-overlay.visible {
		opacity: 0.7;
		pointer-events: auto;
	}

	main {
		position: relative;
		margin: 0 auto;
		padding-top: var(--sk-nav-height);
		padding-bottom: var(--sk-banner-bottom-height);
		height: 100%;
	}

	@media (max-width: 800px) {
		main {
			padding-top: var(--sk-banner-bottom-height);
			padding-bottom: 0;
		}
	}

	:global(body) {
		font-size: 1.6rem !important;
	}
</style>
