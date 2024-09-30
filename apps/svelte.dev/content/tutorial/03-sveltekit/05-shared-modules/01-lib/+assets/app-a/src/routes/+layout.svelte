<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">home</a>
	<a href="/a/deeply/nested/route">a deeply nested route</a>
</nav>

{@render children()}