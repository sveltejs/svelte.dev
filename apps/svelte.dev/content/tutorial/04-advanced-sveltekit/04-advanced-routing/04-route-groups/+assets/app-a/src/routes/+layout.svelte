<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">home</a>
	<a href="/about">about</a>
	<a href="/account">account</a>
	<a href="/app">app</a>
</nav>

{@render children()}
