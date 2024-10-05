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
	<h1>Documentation</h1>
	<p>
		Head to the <a href="/docs/svelte">Svelte</a> or <a href="/docs/kit">SvelteKit</a> reference docs,
		or choose your adventure:
	</p>

	<div class="options">
		<a href="/tutorial">
			<h2>I&rsquo;m brand new here</h2>
			<p>
				We recommend starting with the interactive tutorial, which will teach you how to use Svelte
				right here in your browser.
			</p>
		</a>

		<a href="/docs/svelte/migrating">
			<h2>I&rsquo;m migrating an app from Svelte 4</h2>
			<p>
				If you&rsquo;re already experienced with an older version of Svelte, the migration guide
				will bring you up to speed on the changes in Svelte 5.
			</p>
		</a>

		<a href="/playground">
			<h2>I just want to try it out</h2>
			<p>
				Head over to the playground to see examples, create your own Svelte apps in the browser, and
				share them with other people.
			</p>
		</a>

		<a href="/chat" class="external">
			<h2>Help! I'm stuck</h2>
			<p>
				Join our Discord server where you can hang out with fellow Svelte users and ask them
				questions. It's like an LLM but with people.
			</p>
		</a>
	</div>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: auto;
		text-wrap: balance;
	}

	.options a {
		display: block;
		color: var(--sk-text-2);
		margin: 1em -2em;
		padding: 2em;
		background-color: var(--sk-back-1);
		border-radius: var(--sk-border-radius);

		&:hover {
			background-color: var(--sk-back-2);
			filter: drop-shadow(1px 2px 4px rgb(0 0 0 / 0.1));
			text-decoration: none;

			h2 {
				text-decoration: underline;
			}
		}

		h2 {
			padding-right: 4rem;
			background: url(./arrow-right.svg) no-repeat 100% 50%;
			background-size: 3rem;

			.external & {
				background-image: url(./external-link.svg);
				background-size: 3rem;
			}
		}

		p:last-child {
			margin-bottom: 0;
		}
	}
</style>
