<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Text } from '@sveltejs/site-kit/components';

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
	<header>
		<h1>This page no longer exists</h1>
	</header>

	<Text>
		<p>You may be looking for one of the following:</p>

		<ul>
			{#each docs as doc}
				<li>
					<span style="font-weight:bold">{doc[1][0]}</span> is now
					<a href={doc[1][1]}>here</a>
				</li>
			{/each}
		</ul>
	</Text>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: auto;
		text-wrap: balance;
	}

	ul {
		list-style-type: none;
	}
</style>
