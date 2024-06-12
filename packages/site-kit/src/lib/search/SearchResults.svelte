<!--@component
Renders a list of search results
-->
<script lang="ts">
	import SearchResultList from './SearchResultList.svelte';
	import type { Snippet } from 'svelte';
	import type { Tree } from './types';

	interface Props {
		results: Tree[];
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
		padding: 1rem;
		font-size: 1.2rem;
		font-weight: normal;
		text-transform: uppercase;
		background-color: var(--sk-back-2);
		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		pointer-events: all;
		margin: 0;
	}
</style>
