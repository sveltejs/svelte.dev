<!--@component
Renders a list of search results
-->
<script lang="ts">
	import SearchResultList from './SearchResultList.svelte';
	import type { Snippet } from 'svelte';
	import type { BlockGroup } from './types';

	interface Props {
		results: BlockGroup[];
		query: string;
		onselect?: (href: string) => void;
		children?: Snippet;
	}

	let { results, query, children, onselect }: Props = $props();
</script>

{#if results.length > 0}
	<SearchResultList {results} {query} {onselect} />
{:else if query}
	<p class="info">
		{#if children}
			{@render children()}
		{:else}
			No results
		{/if}
	</p>
{/if}

<style>
	.info {
		padding: var(--padding);
		font: var(--sk-font-ui-medium);
		color: var(--sk-fg-4);
		text-transform: uppercase;
		background-color: var(--sk-bg-2);
		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		pointer-events: all;
		margin: 0;
	}
</style>
