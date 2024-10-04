<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">default</a>
	<a href="/en">english</a>
	<a href="/de">german</a>
	<a href="/fr">french</a>
</nav>

{@render children()}
