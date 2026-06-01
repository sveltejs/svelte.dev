<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	let { children } = $props();

	let previous = $state();
	let start = $state();
	let duration = $state();

	beforeNavigate(({ from, to }) => {
		if (from && to?.url) {
			start = Date.now();
			duration = null;
			previous = { from, to };
		}
	});

	afterNavigate(() => {
		if (previous) {
			duration = Date.now() - start;
		}
	});
</script>

<nav>
	<a href="/">home</a>
	<a href="/slow-a" data-sveltekit-preload-data>slow-a</a>
	<a href="/slow-b">slow-b</a>
</nav>

{@render children()}

{#if previous && duration !== null}
	<p>navigated from {previous.from.url.pathname} to {previous.to.url.pathname} in <strong>{duration}ms</strong></p>
{/if}
