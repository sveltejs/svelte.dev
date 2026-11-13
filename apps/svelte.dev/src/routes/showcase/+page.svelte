<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { arrange } from './arrange.ts';
	import Category from './Category.svelte';
	import Contents from './Contents.svelte';
	import Crowd from './Crowd.svelte';
	import Hero from './Hero.svelte';
	import Mosaic from './Mosaic.svelte';
	import Outro from './Outro.svelte';
	import PauseButton from './PauseButton.svelte';
	import { Player, paused_class, paused_key, set_player } from './player.svelte.ts';
	import { categories, hero, members, more } from './sites.ts';

	const sections = categories.map((category, n) => {
		// the large ones go to those that move, on the left in one category and the right in the next
		const tiles = arrange(members(category.id), (site) => site.clip !== undefined, n % 2 === 1);

		// the first shown in the category, whose screenshot is on the link to it and moves to it
		return { ...category, tiles, lead: tiles[0].site };
	});

	/** plays the clips in the list, and says whether anything moves on its own */
	const player = set_player(new Player());

	onMount(() => player.restore());

	/** marks the page as paused before it is first painted, so it does not change to it after */
	const mark_paused = `try {
		if (localStorage.getItem('${paused_key}')) document.documentElement.classList.add('${paused_class}');
	} catch {}`;

	/**
	 * the hero is on screen, where on phones the floating button would cover the carousel's own
	 * buttons, so it gives way to one under the carousel
	 */
	let hero_seen = $state(true);
</script>

<svelte:head>
	<title>Showcase • Svelte</title>

	<meta name="twitter:title" content="Showcase • Svelte" />
	<meta name="twitter:description" content="Websites built with Svelte and SvelteKit" />
	<meta name="description" content="Websites built with Svelte and SvelteKit" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{page.url.origin}/showcase/card.png" />
	<meta name="og:image" content="{page.url.origin}/showcase/card.png" />

	{@html `<script>${mark_paused}<` + `/script>`}
</svelte:head>

<div class="showcase">
	<!-- first, so the keyboard reaches it before anything that moves, and always there, so clips
	     can be stopped before they start -->
	<PauseButton where="float" tucked={hero_seen} />

	<Hero sites={hero} bind:seen={hero_seen} />

	<Contents {sections} />

	<div class="index">
		{#each sections as section (section.id)}
			<Category id={section.id} title={section.title}>
				<Mosaic tiles={section.tiles} />
			</Category>
		{/each}

		<Category id="also" title="And many more">
			<Crowd sites={more} />
		</Category>

		<Outro />
	</div>
</div>

<style>
	.showcase {
		/* links land below the banner on small screens, where the site nav is at the bottom,
		   otherwise below the nav */
		--anchor-offset: calc(var(--sk-banner-height) + 3.2rem);

		/* the opening lines and the closing ones */
		--display-font: 400 clamp(5.6rem, 1.6rem + 7.6vw, 13.6rem) / 0.95 var(--sk-font-family-heading);
		--lede-font: 400 clamp(2rem, 1.5rem + 0.8vw, 2.8rem) / 1.4 var(--sk-font-family-body);

		/* for what is pressed in a little as it is clicked */
		--quad-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);

		@media (min-width: 832px) {
			--anchor-offset: calc(var(--sk-nav-height) + 3.2rem);
		}
	}

	.index {
		max-width: 140rem;
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-bottom);
	}

	/* what holds a screenshot shows the tiny one behind it, scaled up and so blurred, until the
	   screenshot fades in over it */
	.showcase :global(.frame) {
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);
	}

	/* the screenshot clicked in the hero or the contents travels to its place in the list, while
	   the page jumps there at once under it, as morph.ts sets off. the copy of the screenshot in
	   the list is taller where it is a large one, so it shows only as much as the travelling
	   screenshot has grown to */
	:global(html.picking::view-transition-group(picked)) {
		overflow: clip;
		border-radius: var(--sk-border-radius);
	}

	/* the one in the list stays whole underneath, showing below the picked one where it is taller,
	   while the picked one fades from over it. without the blend the browser adds, which brightens
	   the two where they overlap */
	:global(html.picking::view-transition-old(picked)),
	:global(html.picking::view-transition-new(picked)) {
		animation: none;
		mix-blend-mode: normal;
	}

	:global(html.picking::view-transition-old(picked)) {
		z-index: 1;
	}

	:global(html.picking::view-transition-old(root)),
	:global(html.picking::view-transition-new(root)) {
		animation: none;
		mix-blend-mode: normal;
	}
</style>
