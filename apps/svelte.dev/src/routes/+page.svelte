<script>
	import { Blurb, Footer, TrySection } from '@sveltejs/site-kit/home';
	import Hero from './_home/Hero.svelte';
	import Supporters from './_home/Supporters/index.svelte';
	import WhosUsingSvelte from './_home/WhosUsingSvelte/index.svelte';
	import Features from './_home/Features.svelte';
	import Deployment from './_home/Deployment.svelte';
	import Showcase from './_home/Showcase.svelte';
	import './_home/common.css';
	import HeroSvelteKit from './_home/HeroSvelteKit.svelte';
	import Testimonials from './_home/Testimonials.svelte';
	import Companies from './_home/Companies.svelte';
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

	<Testimonials />

	<Companies />

	<TrySection />

	<!-- SvelteKit stuff -->
	<!-- <HeroSvelteKit />
	<Features /> -->
	<Deployment />

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
