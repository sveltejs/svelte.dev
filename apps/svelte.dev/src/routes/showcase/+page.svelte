<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import { Icon } from '@sveltejs/site-kit/components';
	import { categories, sites } from './sites.ts';

	const screenshots = import.meta.glob<Picture>('./screenshots/*.{jpg,png,webp}', {
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '480;960;1440' }
	});

	/** screenshots by site id */
	const pictures: Record<string, Picture> = Object.fromEntries(
		Object.entries(screenshots).map(([path, picture]) => [
			path.replace(/^.*\/|\.\w+$/g, ''),
			picture
		])
	);

	interface Placement {
		/** percent across */
		x: number;
		/** percent down */
		y: number;
		/** pixels toward the viewer */
		z: number;
		/** degrees turned about the vertical axis */
		r: number;
	}

	// none is first in its category, since those are shown larger below, and only those with a
	// small placement show on small screens, in an arc either side of the one in front
	const field = place([
		{ id: 'spotify', wide: { x: 10, y: 20, z: -100, r: 24 }, small: { x: 50, y: 50, z: 0, r: 0 } },
		{
			id: 'apple-tv',
			wide: { x: 31, y: 10, z: -450, r: 10 },
			small: { x: 82, y: 50, z: -180, r: -28 }
		},
		{ id: 'nrk', wide: { x: 58, y: 7, z: -700, r: -4 }, small: { x: -6, y: 50, z: -420, r: 38 } },
		{ id: 'bugatti', wide: { x: 84, y: 18, z: -200, r: -22 } },
		{
			id: 'city-of-sydney',
			wide: { x: 4, y: 56, z: 150, r: 30 },
			small: { x: 18, y: 50, z: -180, r: 28 }
		},
		{
			id: 'ons-census-maps',
			wide: { x: 96, y: 54, z: 120, r: -30 },
			small: { x: 106, y: 50, z: -420, r: -38 }
		},
		{ id: 'starbucks', wide: { x: 15, y: 86, z: -300, r: 18 } },
		{ id: 'schneider-electric', wide: { x: 39, y: 95, z: -600, r: 6 } },
		{ id: 'the-pudding', wide: { x: 63, y: 93, z: -500, r: -6 } },
		{ id: 'square', wide: { x: 86, y: 86, z: -150, r: -20 } }
	]);

	const sections = categories.map((category) => {
		const members = sites.filter((site) => site.category === category.id);

		return {
			...category,
			sites: members,
			/** the first few with a screenshot, shown on the link to the category */
			preview: members.filter((site) => pictures[site.id]).slice(0, 3)
		};
	});

	// widths of the screenshots as laid out below
	const card_sizes = '(min-width: 1024px) 260px, (min-width: 740px) 400px, 54vw';
	const preview_sizes = '(min-width: 1440px) 230px, (min-width: 900px) 16vw, 34vw';
	const lead_sizes =
		'(min-width: 1440px) 860px, (min-width: 1024px) 59vw, (min-width: 640px) 45vw, 92vw';
	const tile_sizes =
		'(min-width: 1440px) 410px, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 92vw';

	const command = 'npx sv create';

	/** shows a tick on the copy button for a moment after copying */
	let copied = $state(false);
	let uncopy: ReturnType<typeof setTimeout> | undefined;

	function place(cards: Array<{ id: string; wide: Placement; small?: Placement }>) {
		return cards.flatMap(({ id, wide, small }) => {
			const site = sites.find((site) => site.id === id && pictures[id]);
			return site ? [{ site, wide, small }] : [];
		});
	}

	function domain(url: string) {
		return new URL(url).hostname.replace(/^www\./, '');
	}

	/** fades in the screenshots that have not loaded or started to show when the page starts */
	function fade_in(node: HTMLElement) {
		const images = [...node.querySelectorAll('img')].filter(
			(img) => !img.complete && img.naturalWidth === 0
		);

		const show = (event: Event) => {
			(event.currentTarget as HTMLImageElement).style.opacity = '';
		};

		for (const img of images) {
			img.style.opacity = '0';
			img.addEventListener('load', show);
			img.addEventListener('error', show);
		}

		return () => {
			for (const img of images) {
				img.removeEventListener('load', show);
				img.removeEventListener('error', show);
			}
		};
	}

	async function copy() {
		await navigator.clipboard.writeText(command);

		copied = true;
		clearTimeout(uncopy);
		uncopy = setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Showcase • Svelte</title>

	<meta name="twitter:title" content="Showcase • Svelte" />
	<meta name="twitter:description" content="Websites built with Svelte and SvelteKit" />
	<meta name="description" content="Websites built with Svelte and SvelteKit" />
</svelte:head>

<div class="showcase">
	<div class="hero">
		<div class="intro">
			<h1>Built with Svelte</h1>
			<p>From newsrooms to countries, popular brands and leading industries</p>
		</div>

		<div class="field">
			<div class="space">
				{#each field as { site, wide, small } (site.id)}
					<a
						class={['card', { wide: !small }]}
						href="#{site.id}"
						style:--x={wide.x}
						style:--y={wide.y}
						style:--z={wide.z}
						style:--r={wide.r}
						style:--sx={small?.x}
						style:--sy={small?.y}
						style:--sz={small?.z}
						style:--sr={small?.r}
						style:--position={site.screenshot?.position}
						{@attach fade_in}
					>
						<!-- lifts on hover while the link stays put, so the pointer stays on it -->
						<span class="face">
							<enhanced:img
								class="image"
								src={pictures[site.id]}
								alt=""
								loading="lazy"
								sizes={card_sizes}
							/>
						</span>
						<span class="visually-hidden">{site.name}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<nav class="categories" aria-label="Categories">
		<ul>
			{#each sections as section (section.id)}
				<li>
					<a href="#{section.id}" {@attach fade_in}>
						<span class="preview" aria-hidden="true">
							{#each section.preview as site (site.id)}
								<span class="sheet" style:--position={site.screenshot?.position}>
									<enhanced:img
										class="image"
										src={pictures[site.id]}
										alt=""
										loading="lazy"
										sizes={preview_sizes}
									/>
								</span>
							{/each}
						</span>

						<span class="title">{section.title}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="index">
		{#each sections as section (section.id)}
			<section class="category" aria-labelledby={section.id}>
				<h2 id={section.id}>{section.title}</h2>

				<ul class="sites">
					{#each section.sites as site, i (site.id)}
						{@const picture = pictures[site.id]}

						<li class="site" id={site.id}>
							<a
								class="thumb"
								href={site.url}
								target="_blank"
								tabindex="-1"
								aria-hidden="true"
								style:--position={site.screenshot?.position}
								{@attach fade_in}
							>
								{#if picture}
									<enhanced:img
										class="image"
										src={picture}
										alt=""
										loading="lazy"
										sizes={i === 0 ? lead_sizes : tile_sizes}
									/>
								{:else}
									<span class="placeholder">{site.name}</span>
								{/if}
							</a>

							<div class="text">
								<h3><a href={site.url} target="_blank">{site.name}</a></h3>
								<p class="description" lang={site.lang}>{site.description}</p>
								<p class="domain">{domain(site.url)}</p>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}

		<section class="next" aria-labelledby="build-yours">
			<h2 id="build-yours">Build yours</h2>

			<p>
				Run this in a terminal to start a project, or learn Svelte first in the
				<a href="/tutorial">tutorial</a>.
			</p>

			<div class="command">
				<code>{command}</code>

				<button
					class={['raised', 'icon', 'tooltip', { copied }]}
					aria-label={copied ? 'copied' : 'copy to clipboard'}
					onclick={copy}
				>
					<Icon size={18} name={copied ? 'check' : 'copy-to-clipboard-empty'} />
				</button>

				<span class="visually-hidden" aria-live="polite">{copied ? 'Copied' : ''}</span>
			</div>
		</section>
	</div>
</div>

<style>
	.showcase {
		/* links land below the banner on small screens, where the site nav is at the bottom,
		   otherwise below the nav */
		--anchor-offset: calc(var(--sk-banner-height) + 3.2rem);

		@media (min-width: 832px) {
			--anchor-offset: calc(var(--sk-nav-height) + 3.2rem);
		}
	}

	.hero {
		position: relative;
		padding: var(--sk-page-padding-top) 0 0;
		overflow: clip;

		@media (min-width: 1024px) {
			display: grid;
			place-items: center;
			/* sized by the width alone, so the cards keep their places in any window and nothing
			   below moves when the banner or the browser bars show */
			min-height: clamp(64rem, 52vw, 96rem);
			padding: 0;
		}
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

	/* the opening lines and the closing ones */
	.intro h1,
	.next h2 {
		margin: 0;
		font: 400 clamp(5.6rem, 1.6rem + 7.6vw, 13.6rem) / 0.95 var(--sk-font-family-heading);
		letter-spacing: -0.02em;
		color: var(--sk-fg-1);
	}

	.intro p,
	.next p {
		max-width: 20em;
		margin: 2.4rem auto 0;
		font: 400 clamp(2rem, 1.5rem + 0.8vw, 2.8rem) / 1.4 var(--sk-font-family-body);
		color: var(--sk-fg-3);
		text-wrap: balance;
	}

	.field {
		position: relative;
		height: clamp(16rem, 40vw, 34rem);
		margin-top: 2.4rem;
		perspective: 100rem;
		pointer-events: none;

		@media (min-width: 1024px) {
			position: absolute;
			inset: 0;
			height: auto;
			margin: 0;
			perspective: 120rem;
		}
	}

	.space {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
	}

	.card {
		--cx: var(--sx);
		--cy: var(--sy);
		--cz: var(--sz);
		--cr: var(--sr);

		position: absolute;
		left: calc(var(--cx) * 1%);
		top: calc(var(--cy) * 1%);
		width: clamp(18rem, 54vw, 40rem);
		aspect-ratio: 16 / 10;
		transform: translate(-50%, -50%) translateZ(calc(var(--cz) * 1px))
			rotateY(calc(var(--cr) * 1deg));
		transform-style: preserve-3d;
		pointer-events: auto;
		animation: arrive 1.1s var(--quint-out) backwards;
		/* nearest first, so the field fills in from the front */
		animation-delay: calc((150 - var(--cz)) * 0.5ms);

		&.wide {
			display: none;
		}

		@media (min-width: 1024px) {
			--cx: var(--x);
			--cy: var(--y);
			--cz: var(--z);
			--cr: var(--r);

			width: 26rem;

			&.wide {
				display: block;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			animation: fade 0.4s ease backwards;
		}
	}

	.face {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-3);
		box-shadow: 0.2rem 0.4rem 1.6rem rgb(0 0 0 / 0.2);
		transition: filter 0.2s;

		/* further back is fainter, like distance, where the cards are spread out */
		@media (min-width: 1024px) {
			opacity: clamp(0.4, 1 + var(--cz) / 1600, 1);
		}

		/* grey until hovered, like the screenshots on the home page */
		@media all and not (hover: none) {
			filter: grayscale(1) contrast(1);

			.card:hover & {
				filter: grayscale(0) contrast(1);
			}
		}

		@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
			transition:
				translate 0.3s var(--quint-out),
				opacity 0.3s ease,
				filter 0.2s;

			.card:hover & {
				translate: 0 0 6rem;
				opacity: 1;
			}
		}
	}

	/* the field drifts toward you as the page scrolls past it */
	@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: scroll()) {
			.space {
				animation: dolly linear both;
				animation-timeline: scroll(root);
				animation-range: 0 100vh;
			}
		}
	}

	@keyframes arrive {
		from {
			opacity: 0;
			translate: 0 0 -90rem;
		}
	}

	/* little enough that no card grows past the bottom of the hero */
	@keyframes dolly {
		to {
			translate: 0 0 12rem;
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	.categories {
		max-width: 140rem;
		margin: 0 auto;
		padding: 5.6rem var(--sk-page-padding-side) 0;

		@media (min-width: 1024px) {
			padding-top: 6.4rem;
		}

		ul {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 4rem 1.6rem;
			margin: 0;
			padding: 0;
			list-style: none;

			@media (min-width: 900px) {
				grid-template-columns: repeat(4, minmax(0, 1fr));
				gap: 5.6rem 3.2rem;
			}
		}

		a {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 2rem;
			color: var(--sk-fg-1);
			text-decoration: none;
		}
	}

	/* a few of the screenshots in the category, one in front of the others */
	.preview {
		position: relative;
		display: block;
		width: min(70%, 24rem);
		aspect-ratio: 16 / 10;
	}

	.sheet {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-3);
		box-shadow: 0.2rem 0.4rem 1.2rem rgb(0 0 0 / 0.16);

		&:nth-child(1) {
			z-index: 1;
		}

		&:nth-child(2) {
			translate: -24% 0;
			scale: 0.82;
			rotate: -4deg;
		}

		&:nth-child(3) {
			translate: 24% 0;
			scale: 0.82;
			rotate: 4deg;
		}

		@media all and not (hover: none) {
			.image {
				filter: grayscale(1) contrast(1);

				a:is(:hover, :focus-visible) & {
					filter: grayscale(0) contrast(1);
				}
			}
		}

		/* fans out on hover */
		@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
			transition:
				translate 0.3s var(--quint-out),
				rotate 0.3s var(--quint-out);

			a:hover &:nth-child(1) {
				translate: 0 -4%;
			}

			a:hover &:nth-child(2) {
				translate: -34% 2%;
				rotate: -7deg;
			}

			a:hover &:nth-child(3) {
				translate: 34% 2%;
				rotate: 7deg;
			}
		}
	}

	.title {
		font: 400 clamp(2.2rem, 1.6rem + 1vw, 3.2rem) / 1.1 var(--sk-font-family-heading);
		text-align: center;
		text-wrap: balance;
		text-decoration: underline 1px transparent;
		text-underline-offset: 0.2em;
		transition: text-decoration-color 0.2s;

		@media all and not (hover: none) {
			a:hover & {
				text-decoration-color: currentColor;
			}
		}
	}

	.index {
		max-width: 140rem;
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-bottom);
	}

	.category {
		margin: 9.6rem 0 0 0;

		@media (min-width: 1024px) {
			margin-top: 14.4rem;
		}
	}

	h2 {
		margin: 0 0 3.2rem 0;
		font: 400 clamp(3.6rem, 2.4rem + 2vw, 5.6rem) / 1.05 var(--sk-font-family-heading);
		color: var(--sk-fg-1);
		text-wrap: balance;
		scroll-margin-top: var(--anchor-offset);
	}

	.sites {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 4.8rem 3.2rem;
		margin: 0;
		padding: 0;
		list-style: none;

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		@media (min-width: 1024px) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 5.6rem 4rem;
		}
	}

	.site {
		display: flex;
		flex-direction: column;
		min-width: 0;
		scroll-margin-top: var(--anchor-offset);

		h3 {
			margin: 0;
			font: 400 clamp(2.2rem, 1.8rem + 0.4vw, 2.6rem) / 1.15 var(--sk-font-family-heading);

			a {
				color: var(--sk-fg-1);
			}
		}

		.description {
			margin: 0.4rem 0 0 0;
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
		}

		.domain {
			margin: 0.4rem 0 0 0;
			font: var(--sk-font-ui-small);
			color: var(--sk-fg-4);
		}

		/* the one a screenshot at the top links to */
		&:target h3 a {
			color: var(--sk-fg-accent);
		}

		/* the first in each category is shown larger, with its name beside it */
		&:first-child {
			grid-column: 1 / -1;

			h3 {
				font-size: clamp(2.8rem, 2rem + 1.6vw, 4.4rem);
			}

			.description {
				margin-top: 0.8rem;
				font: var(--sk-font-body);
			}

			@media (min-width: 640px) {
				display: grid;
				grid-template-columns: subgrid;
				align-items: end;

				.thumb {
					grid-column: 1 / -2;
					margin: 0;
				}

				.text {
					grid-column: -2;
				}
			}
		}
	}

	.thumb {
		position: relative;
		display: block;
		aspect-ratio: 16 / 10;
		margin: 0 0 1.6rem 0;
		overflow: hidden;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-3);

		/* grey until hovered, like the screenshots on the home page */
		@media all and not (hover: none) {
			.image {
				filter: grayscale(1) contrast(1);
			}

			.site:is(:has(a:hover, :focus-visible), :target) & .image {
				filter: grayscale(0) contrast(1);
			}
		}
	}

	.image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--position, left top);
		transition:
			opacity 0.25s var(--quint-out),
			filter 0.2s;

		/* no fade while the keyboard moves focus, so the colour keeps up with it */
		:is(.categories, .index):has(:focus-visible) & {
			transition: opacity 0.25s var(--quint-out);
		}
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		font: var(--sk-font-h3);
		color: var(--sk-fg-4);
	}

	.next {
		margin: 16rem 0 0 0;
		padding-bottom: 8rem;
		text-align: center;

		@media (min-width: 1024px) {
			margin-top: 24rem;
			padding-bottom: 12rem;
		}
	}

	.command {
		display: inline-flex;
		align-items: center;
		gap: 2rem;
		margin: 4.8rem 0 0 0;
		padding: 1rem 1rem 1rem 2.4rem;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-2);

		code {
			padding: 0;
			background: none;
			font: var(--sk-font-mono);
			font-size: clamp(1.8rem, 1.4rem + 0.6vw, 2.4rem);
			color: var(--sk-fg-1);
		}

		/* the copy icon is filled, unlike the tick */
		button:not(.copied) :global(svg) {
			stroke: none;
		}

		@media (pointer: coarse) {
			button {
				width: 4.4rem;
				height: 4.4rem;
			}
		}
	}
</style>
