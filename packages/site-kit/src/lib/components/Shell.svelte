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
	import ModalOverlay from './ModalOverlay.svelte';

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

{#if $overlay_open}
	<ModalOverlay />
{/if}

<main id="main">
	{@render children?.()}
</main>

<div class="banner-bottom">
	{@render banner_bottom?.()}
</div>

<style>
	main {
		position: relative;
		margin: 0 auto;
		padding-top: var(--sk-nav-height);
		padding-bottom: var(--sk-banner-bottom-height);
		height: 100%;
	}

	@media (max-width: 799px) {
		main {
			padding-top: var(--sk-banner-bottom-height);
			padding-bottom: 0;
		}
	}
</style>
