<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import { untrack } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { crossfade, fly } from 'svelte/transition';
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

	// none is first in its category, which is shown larger below, and neighbours alternate
	// between light and dark headers so each stands out from the one behind it
	const stack = pick([
		'apple-tv',
		'yahoo-finance',
		'spotify',
		'reuters',
		'bugatti',
		'starbucks',
		'nrk'
	]);

	const sections = categories.map((category) => ({
		...category,
		sites: sites.filter((site) => site.category === category.id)
	}));

	let front = $state(0);
	const current = $derived(stack[front]);

	/** the front card was last changed with the keyboard, which does not animate since tab repeats fast */
	let instant = $state(false);

	/** id of the heading scrolled to, if any */
	let active = $state<string>();

	/** the closing section is hidden until it is scrolled to */
	let waiting = $state(false);

	/** category headings then the closing one, in page order */
	const headings = new Set<HTMLElement>();

	let category_list: HTMLUListElement | undefined;

	// slides the line under the current category over to the next one
	const [send, receive] = crossfade({
		duration: (distance) => (prefersReducedMotion.current ? 0 : Math.sqrt(distance * 200))
	});

	/** sites with these ids that have a screenshot */
	function pick(ids: string[]) {
		return ids.flatMap((id) => sites.find((site) => site.id === id && pictures[id]) ?? []);
	}

	/** how far back in the stack a site is, 0 being the front */
	function depth(index: number) {
		return (index - front + stack.length) % stack.length;
	}

	/** fades in a screenshot that has not loaded or started to show when the page starts */
	function fade_in(link: HTMLElement) {
		const img = link.querySelector('img');
		if (!img || img.complete || img.naturalWidth > 0) return;

		img.style.opacity = '0';

		const show = () => {
			img.style.opacity = '';
		};

		img.addEventListener('load', show);
		img.addEventListener('error', show);

		return () => {
			img.removeEventListener('load', show);
			img.removeEventListener('error', show);
		};
	}

	/** shows the closing section once as it is scrolled to, hiding it only if it starts below the window */
	function reveal(section: HTMLElement) {
		let first = true;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (first) {
					first = false;

					if (entry.boundingClientRect.top < innerHeight) {
						observer.disconnect();
						return;
					}

					waiting = true;
				}

				if (entry.isIntersecting) {
					waiting = false;
					observer.disconnect();
				}
			},
			// a little early so it plays as you arrive
			{ rootMargin: '0px 0px -10% 0px' }
		);

		observer.observe(section);

		return () => observer.disconnect();
	}

	function track(heading: HTMLElement) {
		headings.add(heading);

		// untracked so changing active does not rerun this
		untrack(update_active);

		return () => headings.delete(heading);
	}

	/**
	 * the current heading is the last in the top third of the window, or the last one at the
	 * end of the page since it may never get there, and when that is the closing heading no
	 * category is current
	 */
	function update_active() {
		let id: string | undefined;

		for (const heading of headings) {
			if (heading.getBoundingClientRect().top > innerHeight / 3) break;
			id = heading.id;
		}

		if (id && innerHeight + scrollY >= document.documentElement.scrollHeight - 1) {
			id = [...headings].at(-1)?.id;
		}

		if (id === active) return;
		active = id;

		// on narrow screens the categories scroll sideways, so keep the current one in view
		const link = category_list?.querySelector(`[href="#${id}"]`);

		if (category_list && link) {
			const list = category_list.getBoundingClientRect();
			const rect = link.getBoundingClientRect();

			category_list.scrollTo({
				left: category_list.scrollLeft + rect.left - list.left - (list.width - rect.width) / 2,
				behavior: prefersReducedMotion.current ? 'instant' : 'smooth'
			});
		}
	}
</script>

<svelte:window onscroll={update_active} onresize={update_active} />

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

			<p>
				{sites.length} websites made with Svelte and SvelteKit, from global brands to newsrooms, governments
				and small teams.
			</p>
		</div>

		{#if current}
			<ul class={['stack', { instant }]} style:--count={stack.length}>
				{#each stack as site, i (site.id)}
					{@const d = depth(i)}

					<li
						class={{ front: d === 0 }}
						style:--index={i}
						style:--depth={d}
						style:z-index={stack.length - d}
					>
						<!-- a card behind the front one comes forward when clicked or focused with the
						     keyboard, and opens the site once in front -->
						<a
							href={site.url}
							target="_blank"
							style:--position={site.screenshot?.position}
							onclick={(event) => {
								if (d > 0) {
									event.preventDefault();
									instant = false;
									front = i;
								}
							}}
							onfocus={(event) => {
								if (event.currentTarget.matches(':focus-visible')) {
									instant = true;
									front = i;
								}
							}}
						>
							<enhanced:img
								class="image"
								src={pictures[site.id]}
								alt=""
								sizes="(min-width: 1024px) 800px, 100vw"
								fetchpriority={i === 0 ? 'high' : undefined}
							/>
							<span class="visually-hidden">{site.name}</span>
						</a>
					</li>
				{/each}
			</ul>

			{#key current.id}
				<div
					class="current"
					in:fly={{
						y: prefersReducedMotion.current ? 0 : 12,
						duration: instant ? 0 : 250,
						easing: quintOut
					}}
				>
					<p class="name"><a href={current.url} target="_blank">{current.name}</a></p>
					<p class="description" lang={current.lang}>{current.description}</p>
				</div>
			{/key}
		{/if}
	</div>

	<nav class="categories" aria-label="Categories">
		<ul bind:this={category_list}>
			{#each sections as section (section.id)}
				<li>
					<a href="#{section.id}" aria-current={active === section.id ? 'true' : undefined}>
						{section.title}
						<span class="count">{section.sites.length}</span>
					</a>

					{#if active === section.id}
						<span class="line" in:receive={{ key: 'line' }} out:send={{ key: 'line' }}></span>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>

	<div class="page">
		{#each sections as section (section.id)}
			<section aria-labelledby={section.id}>
				<h2 id={section.id} {@attach track}>{section.title}</h2>

				<ul class="sites">
					{#each section.sites as site, i (site.id)}
						{@const picture = pictures[site.id]}

						<li class={['site', { featured: i === 0 }]} id={site.id}>
							<a
								class="screenshot"
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
										sizes={i === 0
											? '(min-width: 1024px) 900px, (min-width: 640px) 90vw, 100vw'
											: '(min-width: 1024px) 440px, (min-width: 640px) 45vw, 100vw'}
									/>
								{:else}
									<span class="placeholder">{site.name}</span>
								{/if}
							</a>

							<h3><a href={site.url} target="_blank">{site.name}</a></h3>

							<p lang={site.lang}>{site.description}</p>
						</li>
					{/each}
				</ul>
			</section>
		{/each}

		<section class={['next', { waiting }]} aria-labelledby="build-yours" {@attach reveal}>
			<h2 id="build-yours" {@attach track}>Build yours</h2>

			<p>
				Start a project with <code>npx sv create</code>, or learn Svelte first in the
				<a href="/tutorial">tutorial</a>.
			</p>
		</section>
	</div>
</div>

<style>
	.showcase {
		/* categories stick under the banner on small screens, where the site nav is at the
		   bottom, otherwise under the nav */
		--sticky-top: var(--sk-banner-height);
		--categories-height: 5.6rem;

		@media (min-width: 832px) {
			--sticky-top: var(--sk-nav-height);
		}
	}

	.hero {
		display: grid;
		grid-template-areas: 'intro' 'stack' 'current';
		gap: 4rem;
		max-width: 140rem;
		margin: 0 auto;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem;

		@media (min-width: 1024px) {
			grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
			grid-template-rows: auto 1fr;
			grid-template-areas: 'intro stack' 'current stack';
			gap: 4rem 6rem;
		}
	}

	.intro {
		grid-area: intro;

		h1 {
			margin: 0;
			font: 400 clamp(5.6rem, 1rem + 6.4vw, 11.2rem) / 0.95 var(--sk-font-family-heading);
			letter-spacing: -0.02em;
			color: var(--sk-fg-1);
		}

		p {
			max-width: 24em;
			margin: 3.2rem 0 0 0;
			color: var(--sk-fg-3);
		}
	}

	.stack {
		/* how much of each card behind the front one shows, and how much smaller it gets */
		--peek: clamp(1.8rem, 0.6rem + 1.8vw, 3.2rem);
		--shrink: 0.035;

		grid-area: stack;
		display: grid;
		margin: 0;
		padding: calc(var(--peek) * (var(--count) - 1)) 0 0 0;
		list-style: none;

		li {
			grid-area: 1 / 1;
			aspect-ratio: 16 / 10;
			transform-origin: 50% 0;
			transform: translateY(calc(var(--depth) * var(--peek) * -1))
				scale(calc(1 - var(--depth) * var(--shrink)));
			transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
			animation: deal 0.6s cubic-bezier(0.23, 1, 0.32, 1) backwards;
			/* front to back by index, not depth, which changes when a card is clicked */
			animation-delay: calc(var(--index) * 50ms);
		}

		&.instant li {
			transition: none;
		}

		/* a card behind the front one lifts a little when hovered, to show it can be clicked */
		@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
			li:not(.front):hover a {
				translate: 0 -0.6rem;
			}
		}

		a {
			transition: translate 0.15s ease;
			display: block;
			height: 100%;
			overflow: hidden;
			border: 1px solid var(--sk-border);
			border-radius: var(--sk-border-radius);
			background: var(--sk-bg-3);
			box-shadow: 0 -0.2rem 1.2rem rgb(0 0 0 / 0.1);

			&:focus-visible {
				outline: 2px solid var(--sk-fg-accent);
				outline-offset: 2px;
			}
		}

		.image {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: var(--position, left top);
		}

		@media (prefers-reduced-motion: reduce) {
			li {
				transition: none;
				animation: none;
			}

			/* a short fade instead, so it is still clear which card came to the front */
			&:not(.instant) li.front {
				animation: fade 0.2s ease;
			}
		}
	}

	@keyframes deal {
		from {
			opacity: 0;
			translate: 0 4rem;
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	.current {
		grid-area: current;
		align-self: end;

		.name {
			margin: 0;
			font: 400 clamp(2.4rem, 1.6rem + 1.2vw, 3.2rem) / 1.2 var(--sk-font-family-heading);

			a {
				color: var(--sk-fg-accent);
			}
		}

		.description {
			margin: 0.4rem 0 0 0;
			color: var(--sk-fg-3);

			/* the same height for one line or two, so the page does not shift when the front card changes */
			@media (max-width: 1023px) {
				min-height: 2lh;
			}
		}
	}

	.categories {
		position: sticky;
		top: var(--sticky-top);
		z-index: 2;
		background: var(--sk-bg-1);
		box-shadow: inset 0 -1px var(--sk-border);

		ul {
			display: flex;
			gap: 3.2rem;
			max-width: 140rem;
			margin: 0 auto;
			padding: 0 var(--sk-page-padding-side);
			overflow-x: auto;
			scrollbar-width: none;
			list-style: none;
		}

		li {
			position: relative;
			flex: none;
		}

		a {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			height: var(--categories-height);
			color: var(--sk-fg-3);
			font: var(--sk-font-ui-medium);
			white-space: nowrap;
			outline-offset: -2px;

			&:hover {
				color: var(--sk-fg-1);
				text-decoration: none;
			}

			&[aria-current='true'] {
				color: var(--sk-fg-accent);
			}
		}

		.count {
			color: var(--sk-fg-4);
			font-variant-numeric: tabular-nums;
		}

		.line {
			position: absolute;
			inset: auto 0 0 0;
			height: 2px;
			background: var(--sk-fg-accent);
		}
	}

	.page {
		max-width: 140rem;
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-bottom);
	}

	section {
		margin: 10rem 0 0 0;

		&:first-child {
			margin-top: 6rem;
		}
	}

	h2 {
		margin: 0 0 3rem 0;
		scroll-margin-top: calc(var(--sticky-top) + var(--categories-height) + 4rem);
	}

	.sites {
		display: grid;
		grid-template-columns: 1fr;
		gap: 5rem 3rem;
		list-style: none;

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (min-width: 1024px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.site {
		display: flex;
		flex-direction: column;
		min-width: 0;
		scroll-margin-top: calc(var(--sticky-top) + var(--categories-height) + 4rem);

		p {
			margin: 0.4rem 0 0 0;
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
		}

		/* the screenshot and the name are the same link, so hovering either one looks the same */
		&:has(a:hover) {
			.screenshot {
				border-color: var(--sk-fg-4);
			}

			h3 a {
				color: var(--sk-fg-accent);
				text-decoration: underline;
			}
		}
	}

	.screenshot {
		position: relative;
		display: block;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-3);
		transition: border-color 0.15s;

		.image {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: var(--position, left top);
			transition: opacity 0.25s cubic-bezier(0.23, 1, 0.32, 1);
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

	h3 {
		margin: 1.6rem 0 0 0;
		font: 400 2.2rem / 1.2 var(--sk-font-family-heading);

		a {
			color: inherit;
			transition: color 0.15s;
		}
	}

	@media (min-width: 640px) {
		.featured {
			grid-column: span 2;
		}
	}

	@media (min-width: 1024px) {
		.featured {
			grid-row: span 2;

			/* as tall as the two sites beside it, cutting off only the bottom of the screenshot
			   like a browser window */
			.screenshot {
				flex: 1;
				aspect-ratio: auto;
				min-height: 30rem;
			}

			h3 {
				font: var(--sk-font-h2);
			}
		}
	}

	.next {
		h2,
		p {
			transition:
				opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1),
				translate 0.5s cubic-bezier(0.23, 1, 0.32, 1);
		}

		p {
			max-width: 32em;
			margin: 0;
			color: var(--sk-fg-3);

			/* after the heading */
			transition-delay: 0.1s;
		}

		&.waiting {
			h2,
			p {
				opacity: 0;
				transition: none;
			}

			@media (prefers-reduced-motion: no-preference) {
				h2 {
					translate: 0 1.6rem;
				}

				p {
					translate: 0 0.8rem;
				}
			}
		}
	}
</style>
