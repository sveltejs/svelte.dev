<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	interface Props {
		docs: Map<string, string[]>;
	}

	const { docs }: Props = $props();

	function get_url_to_redirect_to() {
		const hash = $page.url.hash.slice(1);
		if (hash === '') return;

		const new_docs = docs.get(hash);
		return new_docs && new_docs[1];
	}

	onMount(() => {
		const redirect = get_url_to_redirect_to();
		if (redirect) {
			goto(redirect, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<h1>This page no longer exists</h1>

	<h2>You may be looking for:</h2>

	<ul>
		{#each docs as doc}
			<li>
				<span style="font-weight:bold">{doc[1][0]}</span> is now located at
				<a href={doc[1][1]}>{doc[1][1]}</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: auto;
		text-wrap: balance;
	}

	h1 {
		padding-bottom: 2rem;
	}

	ul {
		list-style-type: none;
	}
</style>
