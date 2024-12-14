<script>
	import { page, navigating } from '$app/state';
	let { children } = $props();
</script>

<nav>
	<a href="/" aria-current={page.url.pathname === '/'}>
		home
	</a>

	<a href="/about" aria-current={page.url.pathname === '/about'}>
		about
	</a>

	{#if navigating.current}
		navigating to {navigating.current.to.url.pathname}
	{/if}
</nav>

{@render children()}
