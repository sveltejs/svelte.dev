<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	// we don't want to use <svelte:window bind:online> here,
	// because we only care about the online state when
	// the page first loads
	const online = browser ? navigator.onLine : true;
</script>

<svelte:head>
	<title>{$page.status}</title>
</svelte:head>

<div class="outer">
	<div class="inner">
		{#if online}
			{#if $page.status === 404}
				<h1>Not found!</h1>
				<p>
					If you were expecting to find something here, please drop by the
					<a href="/chat"> Discord chatroom </a>
					and let us know, or raise an issue on
					<a href="https://github.com/sveltejs/svelte.dev/issues">GitHub</a>. Thanks!
				</p>
			{:else}
				<h1>Yikes!</h1>

				<p>Something went wrong when we tried to render this page. Please try reloading.</p>

				<p>
					If the error persists, please let us know on <a href="/chat">Discord</a> or
					<a href="https://github.com/sveltejs/svelte.dev/issues">GitHub</a>. Thanks!
				</p>
			{/if}
		{:else}
			<h1>It looks like you're offline</h1>
			<p>Reload the page once you've found the internet.</p>
		{/if}
	</div>
</div>

<style>
	.outer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0 var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		width: 100%;
		height: 100%;
	}

	.inner {
		max-width: 48rem;
		text-align: center;
		text-wrap: balance;

		a {
			text-wrap: nowrap;
		}
	}

	p {
		margin: 1em auto;
	}
</style>
