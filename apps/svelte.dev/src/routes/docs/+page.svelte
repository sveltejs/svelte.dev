<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// The old Svelte 3 docs used one giant docs page for everything, with hashes marking sections.
	// This mapping does a best effort to redirect to the new docs.
	const mappings = [
		['before-we-begin', 'overview'],
		['getting-started', 'overview'],
		['component-format', 'svelte-files'],
		['template-syntax-if', 'if'],
		['template-syntax-each', 'each'],
		['template-syntax-await', 'await'],
		['template-syntax-key', 'key'],
		['template-syntax-element-directives', 'basic-markup'],
		['template-syntax-element-directives-bind', 'bindings'],
		['template-syntax-element-directives-class', 'class'],
		['template-syntax-element-directives-style', 'style'],
		['template-syntax-element-directives-use-action', 'use'],
		['template-syntax-element-directives-transition-fn', 'transition'],
		['template-syntax-element-directives-in-fn-out-fn', 'in-and-out'],
		['template-syntax-element-directives-animate-fn', 'animate'],
		['template-syntax-component-directives', 'basic-markup'],
		// not sure what lived here
		// if I guessed right, there's not a great one for this
		['template-syntax-svelte', 'svelte-window'],
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
		['accessibility-warnings', 'compiler-warnings']
	];

	function get_url_to_redirect_to() {
		const hash = $page.url.hash.replace(/^#/i, '');

		if (!hash) return;

		for (const [old_id, new_id] of mappings) {
			if (hash === old_id) return `/docs/svelte/${new_id}`;
		}
	}

	onMount(() => {
		const redirect = get_url_to_redirect_to();
		if (redirect) {
			goto(redirect, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Docs • Svelte</title>
</svelte:head>

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

		<a href="/docs/svelte/v5-migration-guide">
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

		<a href="/docs/llms">
			<h2>I&rsquo;m a Large Language Model (LLM)</h2>
			<p>
				If you&rsquo;re an artificial intelligence, or trying to teach one how to use Svelte, we
				offer the documentation in plaintext format. Beep boop.
			</p>
		</a>

		<a href="https://v4.svelte.dev">
			<h2>I&rsquo;m looking for the old docs</h2>
			<p>
				If you&rsquo;re developing a site using only Svelte 3 or Svelte 4, the old site may be a
				helpful reference until you upgrade.
			</p>
		</a>

		<a href="/chat" class="external">
			<h2>Help! I&rsquo;m stuck</h2>
			<p>
				Join our Discord server where you can hang out with fellow Svelte users and ask them
				questions. It&rsquo;s like an LLM but with people.
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
		color: inherit;
		margin: 1em -1.6rem;
		padding: 1.6rem;
		background-color: var(--sk-bg-1);
		border-radius: var(--sk-border-radius);

		&:hover {
			background-color: var(--sk-bg-2);
			filter: drop-shadow(1px 2px 4px rgb(0 0 0 / 0.1));
			text-decoration: none;
			transform: var(--safari-fix);
			-webkit-transform: var(--safari-fix);

			h2 {
				text-decoration: underline;
			}
		}

		h2 {
			position: relative;
			padding-right: 4rem;

			&::after {
				content: '';
				position: absolute;
				width: 3rem;
				height: 3rem;
				top: 0.2rem;
				right: 0;

				background: var(--sk-fg-accent);
				mask: url(icons/arrow-right) no-repeat 100% 50%;
				mask-size: 100%;
			}

			.external &::after {
				mask-image: url(icons/external-link);
			}
		}

		p:last-child {
			margin-bottom: 0;
		}

		@media (min-width: 480px) {
			margin: 1em -2.4rem;
			padding: 2.4rem;
		}
	}
</style>
