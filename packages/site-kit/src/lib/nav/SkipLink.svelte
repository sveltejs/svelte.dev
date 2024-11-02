<!--@component
Accessibility helper component to skip to the main content
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { href, children }: { href: string; children?: Snippet } = $props();
</script>

<a {href}>
	{#if children}{@render children()}{:else}Skip to main content{/if}
</a>

<style>
	a {
		display: flex;
		align-items: center;
		background: var(--sk-bg-1);
		color: inherit;
		height: calc(var(--sk-nav-height) - 2rem);
		padding: 0 1rem;
		position: absolute;
		inset-block-start: 1rem;
		inset-inline-start: 1rem;
		transform: translateY(-999px);
		font: var(--sk-font-ui-medium);
		z-index: 1000; /* 1 more than the banner z-index */
	}

	a:focus {
		transform: translateY(0%);
	}
</style>
