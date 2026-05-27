<script>
	import { navigating } from '$app/state';

	let { children } = $props();

	let previousCached;
	let startCached;
	const { previous, start } = $derived.by(() => {
		if (navigating.to) {
			previousCached = { ...navigating };
			startCached = Date.now();
		}
		return {
			previous: previousCached,
			start: startCached
		}
	})

	const end = $derived(navigating.to || !start ? null : Date.now());
</script>

<nav>
	<a href="/">home</a>
	<a href="/slow-a" data-sveltekit-preload-data>slow-a</a>
	<a href="/slow-b">slow-b</a>
</nav>

{@render children()}

{#if previous && start && end}
  <p>navigated from {previous.from.url.pathname} to {previous.to.url.pathname} in <strong>{end - start}ms</strong></p>
{/if}
