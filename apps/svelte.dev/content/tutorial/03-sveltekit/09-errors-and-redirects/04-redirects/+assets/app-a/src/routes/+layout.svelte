<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">home</a>
	<a href="/a">a</a>
	<a href="/b">b</a>
</nav>

{@render children()}
