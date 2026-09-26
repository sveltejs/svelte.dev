<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">home</a>
	<a href="/app">page with app error</a>
	<a href="/unknown">page with unknown error</a>
</nav>

{@render children()}
