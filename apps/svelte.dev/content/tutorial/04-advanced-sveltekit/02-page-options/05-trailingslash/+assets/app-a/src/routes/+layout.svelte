<script>
	let { children } = $props();
</script>

<nav>
	<a href="/always">/always</a>
	<a href="/always/">/always/</a>
	<a href="/ignore">/ignore</a>
	<a href="/ignore/">/ignore/</a>
	<a href="/never">/never</a>
	<a href="/never/">/never/</a>
</nav>

{@render children()}
