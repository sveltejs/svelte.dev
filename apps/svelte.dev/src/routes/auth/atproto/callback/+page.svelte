<script lang="ts">
	import * as atproto from '#lib/atproto/auth.js';
	import { onMount } from 'svelte';
	import { storage_key } from '../../_config.js';

	let message = $state('');

	onMount(async () => {
		// the PDS answers with params in the hash (fragment response mode) or the query
		const params = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
		history.replaceState(null, '', location.pathname);

		try {
			await atproto.finalize(params);
			// we can't interact directly with opener, so we use localStorage as a side channel
			localStorage.setItem(storage_key, String(Date.now()));
			window.close();
		} catch (e) {
			console.error('atproto callback failed', e);
			message = (e as Error).message;
		}
	});
</script>

<svelte:head>
	<title>Connecting… • Svelte</title>
</svelte:head>

<div class="callback">
	{#if message}
		<h1>Login failed</h1>
		<pre>{message}</pre>
		<p><a href="/auth/login/atproto">Try again</a></p>
	{:else}
		<p>Connecting…</p>
	{/if}
</div>

<style>
	.callback {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem;
		font: var(--sk-font-ui-medium);
	}

	h1 {
		font: var(--sk-font-h3);
		margin-bottom: 1rem;
	}

	pre {
		white-space: pre-wrap;
		color: #da106e;
	}
</style>
