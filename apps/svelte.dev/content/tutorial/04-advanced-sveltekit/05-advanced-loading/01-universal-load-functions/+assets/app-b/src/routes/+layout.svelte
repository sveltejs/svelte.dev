<script>
	import { page } from '$app/state';

	let { children } = $props();
</script>

<nav
	class={[page.data.color && 'has-color']}
	style:background={page.data.color ?? 'var(--bg-2)'}
>
	<a href="/">home</a>
	<a href="/red">red</a>
	<a href="/green">green</a>
	<a href="/blue">blue</a>

	{#if page.data.component}
		<page.data.component />
	{/if}
</nav>

{@render children()}

<style>
	nav.has-color,
	nav.has-color a {
		color: white;
	}
</style>
