<script lang="ts">
	import { goto } from '$app/navigation';
	import { Text } from '@sveltejs/site-kit/components';

	interface Props {
		docs: Map<string, string[]>;
	}

	const { docs }: Props = $props();

	$effect(() => {
		const hash = location.hash.slice(1);
		if (hash === '') return;

		const new_docs = docs.get(hash);
		if (new_docs) {
			goto(new_docs[1], { replaceState: true });
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
			{#each docs.values() as [title, href]}
				<li>
					<span style="font-weight:bold">{title}</span> is now
					<a {href}>here</a>
				</li>
			{/each}
		</ul>
	</Text>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: auto;
	}
</style>
