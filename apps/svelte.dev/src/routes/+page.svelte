<script>
	import { Blurb, Footer, TrySection } from '@sveltejs/site-kit/home';
	import Hero from './_home/Hero.svelte';
	import Supporters from './_home/Supporters/index.svelte';
	import WhosUsingSvelte from './_home/WhosUsingSvelte/index.svelte';
	import Svelte from './_home/Svelte.svelte';
	import Features from './_home/Features.svelte';
	import Deployment from './_home/Deployment.svelte';
	import Showcase from './_home/Showcase.svelte';
	import './_home/common.css';
	import HeroSvelteKit from './_home/HeroSvelteKit.svelte';
</script>

<svelte:head>
	<title>Svelte • Web development, but fun</title>

	<meta name="twitter:title" content="Svelte" />
	<meta name="twitter:description" content="Web development, but fun" />
	<meta name="Description" content="Web development, but fun" />
</svelte:head>

<div class="home">
	<h1 class="visually-hidden">Svelte</h1>

	<Hero />

	<Blurb --background="var(--sk-back-1)">
		{#snippet one()}
			<div>
				<h2>fast</h2>
				<p>
					Svelte shifts as much work as possible out of the browser and into your build step. No
					more manual optimisations — just faster, smaller and more efficient apps.
				</p>
			</div>
		{/snippet}

		{#snippet two()}
			<div>
				<h2>fun</h2>
				<p>
					Write concise components using languages you already know — HTML, CSS and JavaScript. Get
					things done without fighting the framework. Code with joy.
				</p>
			</div>
		{/snippet}

		{#snippet three()}
			<div>
				<h2>flexible</h2>
				<p>
					Svelte scales from tiny widgets all the way to big full-stack applications. State
					management, motion primitives, form bindings and more — all built-in.
				</p>
			</div>
		{/snippet}
	</Blurb>

	<TrySection />

	<Svelte />

	<HeroSvelteKit />

	<Features />

	<Deployment />

	<Showcase />

	<WhosUsingSvelte />

	<Supporters />

	<Footer
		links={{
			resources: [
				{
					title: 'documentation',
					href: '/docs'
				},
				{
					title: 'tutorial',
					href: '/tutorial'
				},
				{
					title: 'playground',
					href: '/playground'
				},
				{
					title: 'blog',
					href: '/blog'
				}
			],
			connect: [
				{
					title: 'github',
					href: 'https://github.com/sveltejs/svelte'
				},
				{
					title: 'opencollective',
					href: 'https://opencollective.com/svelte'
				},
				{
					title: 'discord',
					href: '/chat'
				},
				{
					title: 'twitter',
					href: 'https://twitter.com/sveltejs'
				}
			]
		}}
	>
		{#snippet license()}
			<span>
				Svelte is <a href="https://github.com/sveltejs/svelte">free and open source software</a> released
				under the MIT license
			</span>
		{/snippet}
	</Footer>
</div>

<style>
	h2 {
		line-height: 1.05;
	}

	p {
		font-size: var(--sk-text-m);
	}
</style>
