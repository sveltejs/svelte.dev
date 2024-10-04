<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">home</a>
	<a href="/blog">blog</a>
</nav>

{@render children()}
