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
		background: var(--sk-back-1);
		color: var(--sk-text-2);
		border: 2px solid var(--sk-text-1);
		padding: 8px;
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		transform: translateY(-999px);
		z-index: 1000; /* 1 more than the banner z-index */
	}

	a:focus {
		transform: translateY(0%);
	}
</style>
