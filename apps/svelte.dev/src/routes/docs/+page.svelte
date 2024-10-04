<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// The old Svelte 3 docs used one giant docs page for everything, with hashes marking sections.
	// This mapping does a best effort to redirect to the new docs.
	const mappings = [
		['before-we-begin', 'overview'],
		['getting-started', 'getting-started'],
		['component-format', 'component-fundamentals'],
		['template-syntax-if', 'control-flow'],
		['template-syntax-each', 'control-flow'],
		['template-syntax-await', 'control-flow'],
		['template-syntax-key', 'control-flow'],
		['template-syntax-element-directives', 'basic-markup'],
		['template-syntax-element-directives-bind', 'bindings'],
		['template-syntax-element-directives-class', 'styles-and-classes'],
		['template-syntax-element-directives-style', 'styles-and-classes'],
		['template-syntax-element-directives-use-action', 'actions'],
		['template-syntax-element-directives-transition-fn', 'transitions-and-animations'],
		['template-syntax-element-directives-in-fn-out-fn', 'transitions-and-animations'],
		['template-syntax-element-directives-animate-fn', 'transitions-and-animations'],
		['template-syntax-component-directives', 'component fundamentals'],
		['template-syntax-svelte', 'special-elements'],
		['template-syntax', 'basic-markup'],
		['run-time-svelte-store', 'svelte-store'],
		['run-time-svelte-motion', 'svelte-motion'],
		['run-time-svelte-transition', 'svelte-transition'],
		['run-time-svelte-animate', 'svelte-animate'],
		['run-time-svelte-easing', 'svelte-easing'],
		['run-time-client-side-component-api', 'imperative-component-api'],
		['run-time-custom-element-api', 'custom-elements'],
		['run-time-server-side-component-api', 'imperative-component-api'],
		['run-time-svelte', 'svelte'],
		['run-time', 'svelte'],
		['compile-time', 'svelte-compiler'],
		['accessibility-warnings', 'TODO']
	];

	function get_url_to_redirect_to() {
		const hash = $page.url.hash.replace(/^#/i, '');

		if (!hash) return;

		for (const [old_id, new_id] of mappings) {
			if (hash.startsWith(old_id)) return `/docs/svelte/${new_id}`;
		}
	}

	onMount(() => {
		const redirect = get_url_to_redirect_to();
		if (redirect) {
			goto(redirect, { replaceState: true });
		}
	});
</script>

<div class="page">
	<div>
		<h2>Svelte</h2>
		<p>Svelte is a compiler-based framework for creating fast and efficient UIs.</p>
		<a href="/docs/svelte">read the docs</a>
	</div>
	<div>
		<h2>SvelteKit</h2>
		<p>
			SvelteKit is a framework for rapidly developing robust, performant web applications using
			Svelte
		</p>
		<a href="/docs/kit">read the docs</a>
	</div>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		justify-items: center;
		max-width: 100rem;
		margin: auto;

		& > div {
			padding: 2rem;
			max-width: 50rem;
		}
	}

	a {
		font-size: var(--sk-font-size-body-small);
	}
</style>
