<script lang="ts">
	import { arrange } from './arrange.ts';
	import Category from './Category.svelte';
	import { Clips } from './clips.svelte.ts';
	import Contents from './Contents.svelte';
	import Crowd from './Crowd.svelte';
	import Hero from './Hero.svelte';
	import { clips, pictures, placeholders, tops } from './media.ts';
	import Mosaic from './Mosaic.svelte';
	import Outro from './Outro.svelte';
	import PauseButton from './PauseButton.svelte';
	import { categories, sites, type Site } from './sites.ts';

	/**
	 * the smaller sites picked for their design, shown after the categories, in rows that run off
	 * either side of the window. in this order, which puts the best known and those that move where
	 * they show whole at every width, and the least known at the ends of rows, where half of one is
	 * cut off: with three, four or six across, the 1st, 12th, 13th, 24th, 25th and 36th are at an
	 * end most often, and the last is left alone on phones and hidden there. any not named here
	 * follow at the end
	 */
	const CROWD = [
		// rows of six on wide screens, starting with one at an end
		'porters-paints',
		'apple-music-100-best',
		'dbrand',
		'viki',
		'logitech',
		'modulus',
		'houses-of-the-world',
		'de-correspondent',
		'cobalt',
		'mill',
		'beyonk',
		'swehl',
		'kumamap',
		'app-store',
		'zenos',
		'akis',
		'mermaid',
		'gestisoft',
		'vert',
		'ripleys',
		'halfspace',
		'llama',
		'chapitre',
		'trading-strategy',
		'ons-local-statistics',
		'apple-podcasts',
		'merlin',
		'anda',
		'nrk',
		'coolify',
		'evidence',
		'kimbia',
		'tangled',
		'poolside',
		'syntax',
		'pronauns',
		'allfeat',
		'ashley',
		'z-ai',
		'pausly'
	];

	const extras = sites.filter((site) => site.more).sort((a, b) => rank(a) - rank(b));

	function rank(site: Site) {
		const i = CROWD.indexOf(site.id);
		return i === -1 ? CROWD.length : i;
	}

	/**
	 * round the ring in the hero, in turn: names known the world over, from as many of the
	 * categories as there are, the light ones between the dark, and most of them moving
	 */
	const HERO = [
		'spotify',
		'nytimes',
		'bugatti',
		'ikea',
		'apple-tv',
		'obama-foundation',
		'hugging-face',
		'square',
		'windy',
		'michelin'
	];

	const ring = HERO.flatMap((id) => {
		const site = sites.find((site) => site.id === id);
		if (!site || !tops[id]) return [];
		return [{ site, picture: tops[id], placeholder: placeholders[id], clip: clips[id] }];
	});

	const sections = categories.map((category, n) => {
		const members = sites.filter((site) => site.category === category.id && !site.more);

		// the large ones go to those that move, on the left in one category and the right in the next
		const tiles = arrange(members, (site) => site.clip !== undefined, n % 2 === 1);
		const first = tiles[0]?.site;

		return {
			...category,
			tiles,
			/** the first shown in the category, whose screenshot is on the link to it and moves to it */
			lead: first && pictures[first.id] ? first : undefined
		};
	});

	/** the clips in the list, and whether anything moves on its own */
	const player = new Clips();

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
	<meta name="twitter:image" content="https://svelte.dev/showcase/card.png" />
	<meta name="og:image" content="https://svelte.dev/showcase/card.png" />
</svelte:head>

<div class="showcase" {@attach () => player.restore()}>
	<!-- first, so the keyboard reaches it before anything that moves, and always there, so clips
	     can be stopped before they start -->
	{#if Object.keys(clips).length > 0 || ring.length > 0}
		<PauseButton {player} where="float" tucked={hero_seen} />
	{/if}

	<Hero cards={ring} {player} bind:seen={hero_seen} />

	<Contents {sections} />

	<div class="index">
		{#each sections as section (section.id)}
			<Category id={section.id} title={section.title}>
				<Mosaic tiles={section.tiles} {player} />
			</Category>
		{/each}

		{#if extras.length > 0}
			<Category id="also" title="And many more">
				<Crowd sites={extras} {player} />
			</Category>
		{/if}

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

		/* the grey over the screenshots towards the top and bottom of the window, with a band in
		   colour across the middle */
		--band: linear-gradient(grey 15%, transparent 35% 55%, grey 75%) top / 100% 100vh no-repeat;

		@media (min-width: 832px) {
			--anchor-offset: calc(var(--sk-nav-height) + 3.2rem);
		}
	}

	.index {
		max-width: 140rem;
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-bottom);
	}

	/* the screenshots grey towards the top and bottom of the window and in colour in a band across
	   the middle, by one layer of grey over the list blended in by saturation, which starts a window
	   above it and moves down with the page, so the band stays still in the window. one for the list
	   rather than each screenshot, so scrolling has few layers to redraw. those pointed at or
	   focused, and the many more, lift above it to stay in colour */
	@supports (animation-timeline: view()) {
		.index {
			--lift: 3;

			position: relative;
			isolation: isolate;
			view-timeline: --list;
			/* to blend with between the screenshots, or the grey shows there */
			background: var(--sk-bg-1);
			/* and none of it above or below the list */
			overflow-y: clip;

			&::after {
				content: '';
				position: absolute;
				inset: -100vh 0 0;
				z-index: 2;
				background: var(--band);
				mix-blend-mode: saturation;
				pointer-events: none;
				animation: stay-in-window linear both;
				animation-timeline: --list;
			}
		}
	}

	@keyframes stay-in-window {
		to {
			translate: 0 100%;
		}
	}

	/* the page jumps at once under the screenshot travelling to its place in the list */
	/* the copy of the screenshot in the list is taller where it is a large one, so it shows only as
	   much as the travelling screenshot has grown to */
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
