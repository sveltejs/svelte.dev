<script module lang="ts">
	/** set once the page has shown, so the field flies in on the first visit and not on coming back */
	let arrived = false;
</script>

<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import { Icon } from '@sveltejs/site-kit/components';
	import { arrange, type Cell } from './arrange.ts';
	import { categories, sites } from './sites.ts';

	const screenshots = {
		...import.meta.glob<Picture>(['./screenshots/*.{jpg,png,webp}', '!./screenshots/*@2x.*'], {
			eager: true,
			import: 'default',
			query: { enhanced: true, w: '480;960;1440' }
		}),
		// the wider ones are taken at twice the size, so they get widths to match
		...import.meta.glob<Picture>('./screenshots/*@2x.{jpg,png,webp}', {
			eager: true,
			import: 'default',
			query: { enhanced: true, w: '480;960;1440;1920;2880' }
		})
	};

	// the top of each, which is all that shows until you point at one. the wider ones go in the large
	// cards, which are as tall as 6:5
	const crops = {
		...import.meta.glob<Picture>(['./screenshots/*.{jpg,png,webp}', '!./screenshots/*@2x.*'], {
			eager: true,
			import: 'default',
			query: { enhanced: true, w: '480;960;1440', aspect: '16:10', fit: 'cover', position: 'top' }
		}),
		...import.meta.glob<Picture>('./screenshots/*@2x.{jpg,png,webp}', {
			eager: true,
			import: 'default',
			query: {
				enhanced: true,
				w: '480;960;1440;1920;2880',
				aspect: '6:5',
				fit: 'cover',
				position: 'top'
			}
		})
	};

	const by_id = (pictures: Record<string, Picture>): Record<string, Picture> =>
		Object.fromEntries(
			Object.entries(pictures).map(([path, picture]) => [
				path.replace(/^.*\/|(@2x)?\.\w+$/g, ''),
				picture
			])
		);

	/** whole screenshots by site id, which the page scrolls down on hover */
	const pictures = by_id(screenshots);

	/** the tops of the screenshots by site id, or the whole of one shown from somewhere else */
	const tops: Record<string, Picture> = Object.fromEntries(
		Object.entries(by_id(crops)).map(([id, crop]) => [
			id,
			sites.find((site) => site.id === id)?.screenshot?.position ? pictures[id] : crop
		])
	);

	/** tiny inline versions of the screenshots by site id, shown blurred until the screenshot loads */
	const placeholders: Record<string, string> = Object.fromEntries(
		Object.entries(
			import.meta.glob<string>('./screenshots/*.{jpg,png,webp}', {
				eager: true,
				import: 'default',
				query: '?w=16&format=webp&inline'
			})
		).map(([path, src]) => [path.replace(/^.*\/|(@2x)?\.\w+$/g, ''), `url(${src})`])
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
		{ id: 'michelin', wide: { x: 39, y: 95, z: -600, r: 6 } },
		{ id: 'the-pudding', wide: { x: 63, y: 93, z: -500, r: -6 } },
		{ id: 'square', wide: { x: 86, y: 86, z: -150, r: -20 } }
	]);

	const arrive = !arrived;

	const sections = categories.map((category) => {
		const members = sites.filter((site) => site.category === category.id);

		return {
			...category,
			cells: arrange(members),
			/** the first few with a screenshot, shown on the link to the category */
			preview: members.filter((site) => pictures[site.id]).slice(0, 3),
			/** the first in the category, when the screenshot in front of the preview is its own */
			lead: members[0] && pictures[members[0].id] ? members[0].id : undefined
		};
	});

	// widths of the screenshots as laid out below
	const card_sizes = '(min-width: 1024px) 17vw, (min-width: 740px) 400px, 54vw';
	const preview_sizes = '(min-width: 1440px) 230px, (min-width: 900px) 16vw, 34vw';

	const wide_sizes: Record<Cell['kind'], string> = {
		beside: '(min-width: 1440px) 860px, (min-width: 1024px) 59vw',
		large: '(min-width: 1440px) 860px, (min-width: 1024px) 59vw',
		half: '(min-width: 1440px) 640px, (min-width: 1024px) 44vw',
		third: '(min-width: 1440px) 410px, (min-width: 1024px) 28vw'
	};

	const medium_sizes: Record<Cell['medium'], string> = {
		beside: '(min-width: 640px) 45vw',
		full: '(min-width: 640px) 92vw',
		half: '(min-width: 640px) 45vw'
	};

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

	/** set while a jump replays its click, so the browser and the router handle it as usual */
	let replaying = false;

	/** starts loading the screenshot of a site in the list before jumping to it */
	function prime(id: string) {
		const image = document.getElementById(id)?.querySelector('img');
		if (image) image.loading = 'eager';
	}

	/**
	 * swaps in the whole screenshot once a mouse rests on one, and marks it once it loads so the page
	 * can scroll down it. touch screens never hover, so they only ever load the tops, and a pointer
	 * passing over loads nothing
	 */
	function lengthen(event: PointerEvent, id: string) {
		const target = event.currentTarget as HTMLElement;
		const img = target
			.closest('.card, .site')
			?.querySelector<HTMLImageElement>(':is(.face, .thumb) img');

		if (
			!img ||
			img.dataset.long !== undefined ||
			// one shown from somewhere other than the top stays where it is
			pictures[id] === tops[id] ||
			event.pointerType !== 'mouse' ||
			!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
				.matches
		) {
			return;
		}

		const timer = setTimeout(() => swap(img, id), 200);
		target.addEventListener('pointerleave', () => clearTimeout(timer), { once: true });
	}

	function swap(img: HTMLImageElement, id: string) {
		if (img.dataset.long !== undefined) return;

		const picture = pictures[id];
		img.dataset.long = 'loading';

		const sources = [...(img.parentElement?.querySelectorAll('source') ?? [])];

		// loaded out of sight first, as the browser would pick it, since swapping it in straight away
		// empties the screenshot until it loads
		const preload = new Image();
		preload.sizes = sources[0]?.sizes ?? '';
		preload.srcset = (sources[0] && picture.sources[sources[0].type.replace('image/', '')]) ?? '';
		preload.src = picture.img.src;

		preload
			.decode()
			.catch(() => {})
			.then(() => {
				img.addEventListener('load', () => (img.dataset.long = 'loaded'), { once: true });

				for (const source of sources) {
					source.srcset = picture.sources[source.type.replace('image/', '')] ?? source.srcset;
				}
				img.src = picture.img.src;
			});
	}

	let following = false;

	/** keeps the hole in the band over the card you point at or focus, as it lifts and the page scrolls */
	function follow(card: HTMLElement) {
		const hero = card.closest<HTMLElement>('.hero');
		if (!hero || following || matchMedia('(hover: none)').matches) return;

		following = true;
		let hole = '';

		const step = () => {
			const face = hero.querySelector('.card:is(:hover, :focus-visible) .face');

			if (!face) {
				hero.style.removeProperty('--hole');
				following = false;
				return;
			}

			const a = face.getBoundingClientRect();
			const b = hero.getBoundingClientRect();
			// the band stays at the top of the window as the page scrolls, so the hole goes where the
			// card is in the window
			// and a little past it, so the glow around it is in colour too
			const pad = 40;
			const next = `${a.left - b.left - pad}px ${a.top - pad}px / ${a.width + pad * 2}px ${a.height + pad * 2}px`;
			if (next !== hole) hero.style.setProperty('--hole', (hole = next));

			requestAnimationFrame(step);
		};

		step();
	}

	/** moves the screenshot you clicked onto the same one in the list as the page jumps there */
	function morph(event: MouseEvent, id: string) {
		const link = event.currentTarget as HTMLAnchorElement;
		const source = link.querySelector<HTMLElement>('.face, .sheet');
		const destination = document.getElementById(id)?.querySelector<HTMLElement>('.thumb');

		if (
			replaying ||
			!source ||
			!destination ||
			!document.startViewTransition ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			// a keyboard press, which should never wait on motion
			event.detail === 0 ||
			matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			return;
		}

		event.preventDefault();
		jump(link, source, destination);
	}

	async function jump(link: HTMLAnchorElement, source: HTMLElement, destination: HTMLElement) {
		// the rest of the category loads too, so it does not land among empty frames
		for (const img of destination.closest('ul')?.querySelectorAll('img') ?? []) {
			img.loading = 'eager';
		}

		// starts at once rather than waiting for the screenshot it lands on, which shows its blurred
		// placeholder until then
		const root = document.documentElement;
		const duration = 300;
		let to!: DOMRect;
		let stand_in: HTMLElement | undefined;

		// back to the top of a screenshot scrolling on hover, which is where it lands
		const scrolled = [...source.querySelectorAll<HTMLElement>('.slide, .slide > .image')];
		for (const el of scrolled) {
			el.style.transition = 'none';
			el.style.translate = '0 0';
		}

		source.style.viewTransitionName = 'picked';
		root.classList.add('picking');

		const transition = document.startViewTransition(() => {
			source.style.viewTransitionName = '';

			replaying = true;
			link.click();
			replaying = false;

			to = destination.getBoundingClientRect();
			stand_in = stand_in_for(destination, source, to);

			// shows under the picked one as it lands, which then fades, so the two never dim each other
			destination.animate(
				[{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1, offset: 0.65 }],
				duration
			);
		});

		transition.finished.finally(() => {
			root.classList.remove('picking');
			stand_in?.remove();
			for (const el of scrolled) {
				el.style.transition = el.style.translate = '';
			}
		});

		try {
			await transition.ready;
		} catch {
			return;
		}

		// safari also leaves an element the page scrolls to where it is, so only the picked one is
		// captured, and travels to where the one in the list is
		root.animate(
			{
				transform: [`translate(${to.left}px, ${to.top}px)`],
				width: [`${to.width}px`],
				height: [`${to.height}px`]
			},
			{
				duration,
				easing: getComputedStyle(root).getPropertyValue('--quint-out').trim(),
				fill: 'both',
				pseudoElement: '::view-transition-group(picked)'
			}
		);

		root.animate(
			// out early, before the card grows past it, so its edge and shadow never show through
			{ opacity: [1, 0] },
			{ duration: duration * 0.3, fill: 'both', pseudoElement: '::view-transition-old(picked)' }
		);

		// fades in over the picked one, whose shape it grows into, so where the one in the list is
		// taller its lower part is revealed on the way rather than arriving after
		root.animate(
			{ opacity: [0, 1] },
			{
				duration: duration * 0.25,
				fill: 'both',
				pseudoElement: '::view-transition-new(picked)'
			}
		);
	}

	/**
	 * a copy of the screenshot in the list, held where it is in the window, which the picked one
	 * travels to. a copy rather than the one in the list, since safari leaves an element the page
	 * scrolls to where it was
	 */
	function stand_in_for(destination: HTMLElement, source: HTMLElement, to: DOMRect) {
		const style = getComputedStyle(destination);
		// whichever has loaded, since both are the same top of the screenshot, so it never turns from
		// sharp to blurred on the way
		const image = [destination.querySelector('img'), source.querySelector('img')].find(
			(img) => img?.complete && img.naturalWidth > 0
		);

		const stand_in = document.createElement('div');
		Object.assign(stand_in.style, {
			position: 'fixed',
			left: `${to.left}px`,
			top: `${to.top}px`,
			width: `${to.width}px`,
			height: `${to.height}px`,
			overflow: 'hidden',
			borderRadius: style.borderRadius,
			background: style.background,
			pointerEvents: 'none',
			viewTransitionName: 'picked'
		});

		if (image?.currentSrc) {
			const copy = new Image();
			copy.src = image.currentSrc;
			Object.assign(copy.style, {
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				objectPosition: getComputedStyle(image).objectPosition
			});
			stand_in.append(copy);

			// and behind the one in the list until its own loads, so it does not turn blurred on landing
			if (!destination.contains(image)) {
				destination.style.setProperty('--placeholder', `url("${image.currentSrc}")`);
			}
		}

		document.body.append(stand_in);
		return stand_in;
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

{#snippet screenshot(id: string, sizes: string, loading: 'eager' | 'lazy')}
	{@const picture = tops[id]}
	<picture class="slide">
		{#each Object.entries(picture.sources) as [format, srcset] (format)}
			<source {srcset} {sizes} type="image/{format}" />
		{/each}
		<img
			class="image"
			src={picture.img.src}
			width={picture.img.w}
			height={picture.img.h}
			alt=""
			{loading}
		/>
	</picture>
{/snippet}

<div class="showcase">
	<div
		class={['hero', { arrive }]}
		{@attach () => {
			arrived = true;
		}}
	>
		<div class="intro">
			<h1>Built with <span>Svelte</span></h1>
			<p>From newsrooms to public services, popular brands and leading industries</p>
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
						style:--placeholder={placeholders[site.id]}
						onclick={(event) => morph(event, site.id)}
						onpointerenter={(event) => {
							prime(site.id);
							follow(event.currentTarget);
							lengthen(event, site.id);
						}}
						onfocus={(event) => {
							prime(site.id);
							follow(event.currentTarget);
						}}
						{@attach fade_in}
					>
						<!-- lifts on hover while the link stays put, so the pointer stays on it -->
						<span class="face">
							<!-- lazy where it is hidden on small screens, so phones never load it -->
							{@render screenshot(site.id, card_sizes, small ? 'eager' : 'lazy')}
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
					<a
						href="#{section.id}"
						onclick={(event) => section.lead && morph(event, section.lead)}
						onpointerenter={() => section.lead && prime(section.lead)}
						onfocus={() => section.lead && prime(section.lead)}
						{@attach fade_in}
					>
						<span class="preview" aria-hidden="true">
							{#each section.preview as site (site.id)}
								<span
									class="sheet"
									style:--position={site.screenshot?.position}
									style:--placeholder={placeholders[site.id]}
								>
									{@render screenshot(site.id, preview_sizes, 'lazy')}
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
					{#each section.cells as { site, kind, medium } (site.id)}
						{@const picture = pictures[site.id]}

						<li
							class={['site', kind, `medium-${medium}`]}
							id={site.id}
							style:--position={site.screenshot?.position}
							style:--placeholder={placeholders[site.id]}
						>
							<!-- for the pointer only, keyboards and screen readers use the link on the name -->
							<a
								class="thumb"
								href={site.url}
								tabindex="-1"
								aria-hidden="true"
								onpointerenter={(event) => lengthen(event, site.id)}
								{@attach fade_in}
							>
								{#if picture}
									{@render screenshot(
										site.id,
										`${wide_sizes[kind]}, ${medium_sizes[medium]}, 92vw`,
										'lazy'
									)}
								{:else}
									<span class="placeholder">{site.name}</span>
								{/if}
							</a>

							<div class="text">
								<h3>
									<a href={site.url} onpointerenter={(event) => lengthen(event, site.id)}
										>{site.name}</a
									>
								</h3>
								<p class="description" lang={site.lang}>{site.description}</p>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}

		<section class="next" aria-labelledby="your-turn">
			<h2 id="your-turn">It's your turn</h2>

			<p>
				Use our CLI to create a new project, or try our
				<a href="/tutorial">interactive tutorial</a>.
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
		/* a stacking context of its own, or safari drops frames as a card lifts on hover */
		isolation: isolate;
		padding: var(--sk-page-padding-top) 0 0;
		overflow: clip;
		/* about where the name in the heading sits in the window before scrolling, on its second line */
		--heading: calc(var(--sk-page-padding-top) + 1.5 * clamp(5.6rem, 1.6rem + 7.6vw, 13.6rem));

		@media (min-width: 1024px) {
			display: grid;
			place-items: center;
			/* sized by the width alone, so the cards keep their places in any window and nothing
			   below moves when the banner or the browser bars show, and tall enough that the cards
			   leave the heading room around it */
			--hero-height: clamp(76rem, 60vw, 108rem);
			min-height: var(--hero-height);
			padding: 0;
			/* centred with the line below it, so a little above the middle */
			--heading: calc(var(--sk-nav-height) + var(--hero-height) / 2 - 5rem);
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

	.intro h1 span {
		color: var(--sk-fg-accent);
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

		.arrive & {
			animation: arrive 1.1s var(--quint-out) backwards;
			/* nearest first, so the field fills in from the front */
			animation-delay: calc((150 - var(--cz)) * 0.5ms);

			@media (prefers-reduced-motion: reduce) {
				animation: fade 0.4s ease backwards;
			}
		}

		&.wide {
			display: none;
		}

		@media (min-width: 1024px) {
			--cx: var(--x);
			--cy: var(--y);
			--cz: var(--z);
			--cr: var(--r);

			/* smaller in narrower windows, where the heading takes up more of the width */
			width: clamp(22rem, 17vw, 28rem);

			&.wide {
				display: block;
			}
		}
	}

	/* a soft light in the colours of the screenshot, like the ambient mode on youtube: the tiny copy
	   shown while it loads, the same shape as the screenshot, spread past its edges and blurred */
	.card::before,
	.site::before {
		--glow: 0.27;

		content: '';
		position: absolute;
		z-index: -1;
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat;
		filter: blur(3.2rem);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	/* fainter in the dark, where any light shows much more; a pseudo-element can't be the parent of
	   a nested rule, so this is written out in full */
	:global(:root.dark) :is(.card, .site)::before {
		--glow: 0.17;
	}

	/* behind the card at rest, so it stays put as the card lifts toward you */
	.card::before {
		inset: 0;
		scale: 1 1.04;
		translate: 0 0.8rem;
	}

	.site {
		position: relative;
		isolation: isolate;

		&::before {
			inset: 0 0 auto;
			/* as tall as the screenshot where the card is a column, and in its cell where it is a grid */
			aspect-ratio: 16 / 10;
			/* spreads further up and down than across, and falls a little below, like light from a
			   screen */
			scale: 1 1.04;
			translate: 0 0.8rem;
		}
	}

	/* with the colour, as you point at or focus a site */
	@media all and not (hover: none) {
		.card:is(:hover, :focus-visible)::before,
		.site:has(a:hover, :focus-visible)::before {
			opacity: var(--glow);
		}
	}

	.face {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: var(--sk-border-radius);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);
		box-shadow: 0.2rem 0.4rem 1.6rem rgb(0 0 0 / 0.2);
		transition: filter 0.2s;

		/* further back is fainter, like distance, where the cards are spread out */
		@media (min-width: 1024px) {
			opacity: clamp(0.4, 1 + var(--cz) / 1600, 1);
		}

		/* grey until hovered, like the screenshots on the home page */
		@media all and not (hover: none) {
			filter: grayscale(1) contrast(1);

			.card:is(:hover, :focus-visible) & {
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

	/* the page jumps at once under the screenshot travelling to its place in the list */
	/* the copy of the screenshot in the list is taller where it is a large one, so it shows only as
	   much as the travelling screenshot has grown to */
	:global(html.picking::view-transition-group(picked)) {
		overflow: clip;
		border-radius: var(--sk-border-radius);
	}

	:global(html.picking::view-transition-old(root)),
	:global(html.picking::view-transition-new(root)) {
		animation: none;
		mix-blend-mode: normal;
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
			/* only the screenshots and the title, not the empty space beside them */
			pointer-events: none;
		}
	}

	/* a few of the screenshots in the category, one in front of the others */
	.preview {
		position: relative;
		display: block;
		width: min(70%, 24rem);
		aspect-ratio: 16 / 10;
		pointer-events: auto;

		/* as wide as the screenshots fanned out at rest, and still while they move, so the pointer
		   never falls off one as it moves and starts it moving back */
		&::before {
			content: '';
			position: absolute;
			inset: 0 -17%;
		}
	}

	.sheet {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: var(--sk-border-radius);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);
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

	.title,
	.site h3 a,
	.next p a {
		text-decoration-line: underline;
		text-underline-offset: 0.2em;
		text-decoration-color: transparent;
		transition: text-decoration-color 0.15s;
	}

	/* faint even at rest, since it sits among words that are not links */
	.next p a {
		text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
	}

	.title {
		position: relative;
		pointer-events: auto;
		font: 400 clamp(2.2rem, 1.6rem + 1vw, 3.2rem) / 1.1 var(--sk-font-family-heading);

		/* the gap up to the screenshots, so the pointer stays on the link between them */
		&::before {
			content: '';
			position: absolute;
			inset: -2rem 0 0 0;
		}
		text-align: center;
		text-wrap: balance;

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
		--column-gap: 3.2rem;

		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 4.8rem var(--column-gap);
		margin: 0;
		padding: 0;
		list-style: none;

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		/* six, so a row can take thirds, halves, or a large one and a third */
		@media (min-width: 1024px) {
			--column-gap: 4rem;

			grid-template-columns: repeat(6, minmax(0, 1fr));
			gap: 5.6rem var(--column-gap);
		}
	}

	.site {
		display: flex;
		flex-direction: column;
		min-width: 0;
		scroll-margin-top: var(--anchor-offset);

		h3 {
			position: static;
			margin: 0;
			font: 400 clamp(2.2rem, 1.8rem + 0.4vw, 2.6rem) / 1.15 var(--sk-font-family-heading);

			a {
				position: static;
				color: var(--sk-fg-1);

				/* covers the text and the gap above it, so the description links to the site too, but
				   leaves out any empty space in the card */
				&::after {
					content: '';
					position: absolute;
					inset: -1.6rem 0 0 0;
				}
			}
		}

		@media all and not (hover: none) {
			&:has(a:hover) h3 a {
				text-decoration-color: currentColor;
			}
		}

		.text {
			position: relative;
		}

		.description {
			margin: 0.4rem 0 0 0;
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
		}

		&:is(.beside, .large) {
			h3 {
				font-size: clamp(2.8rem, 2rem + 1.6vw, 4.4rem);
			}

			.description {
				margin-top: 0.8rem;
				font: var(--sk-font-body);
			}
		}

		@media (640px <= width < 1024px) {
			&:is(.medium-beside, .medium-full) {
				grid-column: 1 / -1;
			}

			&.medium-beside {
				display: grid;
				grid-template-columns: subgrid;
				align-items: end;

				.thumb {
					grid-column: 1;
					margin: 0;
				}

				/* in the screenshot's cell, which is not as wide as the card, with both lines given
				   since an absolutely positioned one otherwise reaches the edge of the card */
				&::before {
					grid-area: 1 / 1 / 2 / 2;
					inset: 0;
					aspect-ratio: auto;
				}

				h3 a::after {
					inset: 0 0 0 calc(-1 * var(--column-gap));
				}
			}
		}

		/* a row for the screenshots and a row for the text, so a large one lines up with the two
		   stacked beside it */
		@media (min-width: 1024px) {
			display: grid;
			grid-template-rows: subgrid;
			grid-row: span 2;
			grid-column: span 2;
			row-gap: 1.6rem;
			/* the text no taller than it is, so the space below a shorter one does not link anywhere */
			align-items: start;

			.thumb {
				margin: 0;
			}

			/* the glow in the screenshot's cell, so it is the same size as the screenshot */
			&::before {
				grid-row: 1 / 2;
				grid-column: 1 / -1;
				inset: 0;
				aspect-ratio: auto;
			}

			&.half {
				grid-column: span 3;
			}

			&.large {
				grid-column: span 4;
				grid-row: span 4;

				/* as tall as the two stacked beside it, which shows more of the page since the
				   screenshots are square */
				.thumb {
					grid-row: span 3;
					align-self: stretch;

					&::before {
						padding-top: 0;
					}
				}

				&::before {
					grid-row: 1 / span 3;
				}
			}

			/* every other category has it on the right, with the two after it stacked on its left */
			.category:nth-child(even) &.large {
				grid-column: 3 / -1;
				grid-row: 1 / span 4;

				& + .third,
				& + .third + .third {
					grid-column: 1 / span 2;
				}
			}

			&.beside {
				grid-column: 1 / -1;
				grid-template-columns: subgrid;
				align-items: end;

				.thumb,
				&::before {
					grid-column: 1 / -3;
					grid-row: 1 / -1;
				}

				.text {
					grid-column: -3 / -1;
					grid-row: 1 / -1;
				}

				h3 a::after {
					inset: 0 0 0 calc(-1 * var(--column-gap));
				}
			}
		}
	}

	.thumb {
		position: relative;
		display: block;
		margin: 0 0 1.6rem 0;
		overflow: hidden;
		text-decoration: none;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);

		/* 16:10 by padding, since safari leaves out aspect-ratio when sizing the rows of a subgrid */
		&::before {
			content: '';
			display: block;
			padding-top: 62.5%;
		}
	}

	/* grey until hovered like the screenshots on the home page, and where colour can follow scrolling,
	   grey towards the top and bottom of the window and in colour only as they reach the middle */
	@media all and not (hover: none) {
		.thumb,
		.sheet {
			--greyscale: 1;

			.site:is(:has(a:hover, :focus-visible), :target) &,
			a:is(:hover, :focus-visible) & {
				--greyscale: 0;
			}

			/* on the whole screenshot rather than the image, so the placeholder behind it is grey too */
			@supports not (animation-timeline: view()) {
				filter: grayscale(var(--greyscale)) contrast(1);
				transition: filter 0.2s;
			}
		}

		@supports (animation-timeline: view()) {
			/* a timeline leaves out how the cards in the hero turn in 3d, so one band covers them all, with
			   a hole over the one you point at so the others stay as they are */
			.hero {
				--greyscale: 1;
				/* for the band to blend with between the cards, or it shows as grey */
				background: var(--sk-bg-1);

				.face {
					filter: grayscale(0) contrast(1);
				}

				/* over the heading too, so the name in it fades with the screenshots */
				&::after {
					z-index: 2;
					mask:
						linear-gradient(#000 0 0),
						linear-gradient(#000 0 0) var(--hole, 0 0 / 0 0) no-repeat;
					mask-composite: exclude;
				}
			}
		}

		.thumb,
		.sheet,
		.hero {
			@supports (animation-timeline: view()) {
				view-timeline: --screenshot;
				isolation: isolate;

				/* starts a window above the screenshot and moves down by its own height as the screenshot
				   scrolls past, so the gradient stays still on the window */
				&::after {
					content: '';
					position: absolute;
					inset: -100vh 0 0 0;
					/* the colour reaches further up than down, so some of the hero is in colour before
					   any scrolling */
					background: linear-gradient(grey 15%, transparent 35% 55%, grey 75%) top / 100% 100vh
						no-repeat;
					opacity: var(--greyscale);
					mix-blend-mode: saturation;
					pointer-events: none;
					transition: opacity 0.2s;
					animation: stay-in-window linear both;
					animation-timeline: --screenshot;
				}

				/* the hero is sized by the width and the band by the height, so the colour is placed around
				   the name in the heading, wherever that falls in the window, and not at a set height */
				&.hero::after {
					background-image: linear-gradient(
						grey calc(var(--heading) - 28vh),
						transparent calc(var(--heading) - 8vh) calc(var(--heading) + 12vh),
						grey calc(var(--heading) + 32vh)
					);
				}

				:is(.categories, .index):has(:focus-visible) &::after {
					transition: none;
				}
			}
		}
	}

	@keyframes stay-in-window {
		to {
			translate: 0 100%;
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

	.slide {
		position: absolute;
		inset: 0;
		display: block;
	}

	/* scrolls slowly down the screenshot on hover, like a glance down the site, and back up quickly as
	   the pointer leaves. a short delay keeps it still as the pointer passes over */
	@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
		/* once the whole screenshot has loaded in place of the top of it, the picture moves down by its
		   own height, which is the card's, and the screenshot in it up by its own, so its bottom ends at
		   the bottom of the card. both are transforms, so nothing is redrawn as it moves */
		:is(.thumb, .face) .slide:has(> .image:global([data-long='loaded'])) {
			transition: translate 0.6s var(--quint-out);

			> .image {
				height: auto;
				transition:
					opacity 0.25s var(--quint-out),
					filter 0.2s,
					translate 0.6s var(--quint-out);
			}

			:is(.site:has(a:hover), .card:hover) & {
				translate: 0 100%;
				transition: translate 3s cubic-bezier(0.45, 0, 0.55, 1) 0.2s;

				> .image {
					translate: 0 -100%;
					transition:
						opacity 0.25s var(--quint-out),
						filter 0.2s,
						translate 3s cubic-bezier(0.45, 0, 0.55, 1) 0.2s;
				}
			}
		}
	}

	.placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
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

		h2 {
			/* room for the descenders, which hang below the tight line height */
			padding-bottom: 0.08em;
		}

		p {
			margin-top: 3.5rem;
		}

		@media all and not (hover: none) {
			p a:hover {
				text-decoration-color: currentColor;
			}
		}
	}

	.command {
		display: inline-flex;
		align-items: center;
		gap: 2rem;
		margin: 3.6rem 0 0 0;
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

		@media (pointer: coarse) {
			button {
				width: 4.4rem;
				height: 4.4rem;
			}
		}
	}
</style>
