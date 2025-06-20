<script>
	import { navigating } from '$app/state';

	let { children } = $props();

	let previous = $state();
	let start = $state();
	let end = $state();

	$effect(() => {
		if (navigating.to) {
			start = Date.now();
			end = null;
			previous = { ...navigating };
		} else {
			end = Date.now();
		}
	});
</script>

<nav>
	<a href="/">home</a>
	<a href="/slow-a">slow-a</a>
	<a href="/slow-b">slow-b</a>
</nav>

{@render children()}

{#if previous && end}
	<p>navigated from {previous.from.url.pathname} to {previous.to.url.pathname} in <strong>{end - start}ms</strong></p>
{/if}