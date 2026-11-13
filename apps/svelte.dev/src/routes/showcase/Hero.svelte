<!--@component
the heading of the page and the carousel of sites under it. sets `seen` while it is on screen
-->
<script lang="ts">
	import Carousel from './Carousel.svelte';
	import { morph, morph_history, prime } from './morph.ts';
	import { on_screen } from './on-screen.ts';
	import PauseButton from './PauseButton.svelte';
	import { get_player } from './player.svelte.ts';
	import type { Site } from './sites.ts';

	interface Props {
		/** round the carousel, in turn */
		sites: Site[];
		/** the hero is on screen */
		seen?: boolean;
	}

	let { sites, seen = $bindable(true) }: Props = $props();

	const player = get_player();
</script>

<div
	class="hero"
	{@attach on_screen((entry) => (seen = entry.isIntersecting))}
	{@attach morph_history}
>
	<div class="intro">
		<h1>Built with <span>Svelte</span></h1>
		<p>From newsrooms to public services, popular brands and leading industries</p>
	</div>

	<Carousel
		{sites}
		autoplay={player.autoplay}
		sizes="(min-width: 740px) 440px, 60vw"
		onpick={morph}
		onprime={prime}
	>
		{#snippet controls()}
			<PauseButton where="inline" />
		{/snippet}
	</Carousel>
</div>

<style>
	.hero {
		position: relative;
		/* a stacking context of its own, or safari drops frames as the ring turns */
		isolation: isolate;
		padding: var(--sk-page-padding-top) 0 0;
		overflow: clip;
	}

	.intro {
		position: relative;
		z-index: 1;
		padding: 0 var(--sk-page-padding-side);
		text-align: center;

		/* keeps the text clear of the screenshots, like the headings on the home page */
		h1,
		p {
			filter: drop-shadow(0 0 1rem var(--sk-bg-1)) drop-shadow(0 0 1rem var(--sk-bg-1));
		}
	}

	h1 {
		margin: 0;
		font: var(--display-font);
		letter-spacing: -0.02em;
		color: var(--sk-fg-1);

		span {
			color: var(--sk-fg-accent);
		}
	}

	p {
		max-width: 20em;
		margin: 2.4rem auto 0;
		font: var(--lede-font);
		color: var(--sk-fg-3);
		text-wrap: balance;
	}
</style>
