<script module lang="ts">
	/** set once the page has shown, so the ring spins in on the first visit and not on coming back */
	let arrived = false;
</script>

<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import type { Attachment } from 'svelte/attachments';
	import { arrange, type Tile } from './arrange.ts';
	import Carousel from './Carousel.svelte';
	import { categories, sites, type Site } from './sites.ts';

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

	/**
	 * the tops of the screenshots by site id, or the whole of one shown from somewhere else, or of
	 * one no taller than its top, which cropping to 6:5 would cut at the sides instead
	 */
	const tops: Record<string, Picture> = Object.fromEntries(
		Object.entries(by_id(crops)).map(([id, crop]) => {
			const whole = pictures[id];
			const position = sites.find((site) => site.id === id)?.screenshot?.position;
			return [id, position || whole.img.h / whole.img.w <= 5 / 6 ? whole : crop];
		})
	);

	/** the recordings of sites whose motion a screenshot misses, by site id */
	const clips: Record<string, string> = Object.fromEntries(
		Object.entries(
			import.meta.glob<string>('./clips/*.mp4', { eager: true, import: 'default', query: '?url' })
		).map(([path, src]) => [path.replace(/^.*\/|\.mp4$/g, ''), src])
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

	/** sites whose clips scroll down the page, which only play when pointed at or focused */
	const scrolling = new Set(
		sites.filter((site) => typeof site.clip === 'object' && site.clip.travel).map((site) => site.id)
	);

	const arrive = !arrived;

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

	// widths of the screenshots as laid out below
	const card_sizes = '(min-width: 740px) 440px, 60vw';

	const sizes: Record<Tile['size'], string> = {
		big: '(min-width: 1440px) 680px, (min-width: 1280px) 48vw, (min-width: 740px) 64vw, (min-width: 640px) 48vw, 92vw',
		small:
			'(min-width: 1440px) 330px, (min-width: 1280px) 24vw, (min-width: 740px) 32vw, (min-width: 640px) 48vw, 92vw'
	};

	const command = 'npx sv create';

	/** shows a tick on the copy button for a moment after copying */
	let copied = $state(false);

	/** shows the tick as if pressed, for a press by the keyboard */
	let flash = $state(false);
	let uncopy: ReturnType<typeof setTimeout> | undefined;

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
		const scope = target.closest<HTMLElement>('.card, .site');
		const host = scope?.querySelector<HTMLElement>('.face, .thumb');
		const img = host?.querySelector('img');

		if (
			!scope ||
			!host ||
			!img ||
			event.pointerType !== 'mouse' ||
			!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
				.matches
		) {
			return;
		}

		// one with a clip plays it instead, until the pointer leaves the site
		if (clips[id]) {
			const timer = setTimeout(() => play(host, id), 100);
			scope.addEventListener(
				'pointerleave',
				() => {
					clearTimeout(timer);
					release(host);
				},
				{ once: true }
			);
			return;
		}

		// one shown from somewhere other than the top stays where it is
		// nor one no taller than the window, with nothing further down to show
		const whole = pictures[id].img;
		const slide = img.parentElement;
		if (!slide || pictures[id] === tops[id] || whole.h / whole.w < 0.7) return;

		let left = false;
		const timer = setTimeout(() => {
			if (img.dataset.long === 'loaded') glance(slide, img);
			else swap(img, id, () => left || glance(slide, img));
		}, 100);

		target.addEventListener(
			'pointerleave',
			() => {
				left = true;
				clearTimeout(timer);
				settle(slide, img);
			},
			{ once: true }
		);
	}

	/** how far each fling goes, relative to the others, so it reads as a hand on the trackpad */
	const flings = [1, 1.3, 0.8, 1.15, 0.9, 1.25, 0.7, 1.05];

	/**
	 * moves the picture down by its own height, which is the card's, and the screenshot in it up by
	 * its own, so its bottom ends at the bottom of the card, a fling at a time like scrolling by
	 * hand: each one quick at first and coasting to a stop, then a moment's rest before the next.
	 * animated from where each is rather than by a transition, which safari starts at the end when
	 * the screenshot has only just lengthened
	 */
	function glance(slide: HTMLElement, img: HTMLImageElement) {
		// from as far down as it already is, if it was on its way back up
		const [, y = '0'] = getComputedStyle(slide).translate.split(' ');
		const start = y.endsWith('%') ? parseFloat(y) / 100 : 0;

		// about a card's height a fling
		const below = (img.offsetHeight / slide.offsetHeight - 1) * (1 - start);
		const count = Math.min(Math.max(Math.round(below), 1), 8);
		const weights = Array.from({ length: count }, (_, i) => flings[i % flings.length]);
		const total = weights.reduce((sum, weight) => sum + weight, 0);

		const at: Array<{ offset: number; done: number; easing: string }> = [];
		let done = start;
		weights.forEach((weight, i) => {
			at.push({ offset: i / count, done, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
			done += ((1 - start) * weight) / total;
			at.push({ offset: (i + 0.88) / count, done, easing: 'linear' });
		});
		at.push({ offset: 1, done: 1, easing: 'linear' });

		// a moment on the top of the page first, unless it was already on its way
		const options = {
			duration: count * 1700,
			delay: start > 0 ? 0 : 300,
			fill: 'forwards' as const
		};
		move(
			slide,
			at.map(({ offset, done, easing }) => ({ offset, easing, translate: `0 ${done * 100}%` })),
			options
		);
		move(
			img,
			at.map(({ offset, done, easing }) => ({ offset, easing, translate: `0 ${done * -100}%` })),
			options
		);
	}

	/** back up quickly as the pointer leaves */
	function settle(slide: HTMLElement, img: HTMLImageElement) {
		const options = { duration: 600, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };

		for (const element of [slide, img]) {
			const from = getComputedStyle(element).translate;
			if (!element.getAnimations().some((animation) => animation.id === 'glance')) continue;
			move(element, [{ translate: from === 'none' ? '0 0' : from }, { translate: '0 0' }], options);
		}
	}

	function move(element: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
		for (const animation of element.getAnimations()) {
			if (animation.id === 'glance') animation.cancel();
		}

		element.animate(keyframes, { ...options, id: 'glance' });
	}

	/** plays the clip over a screenshot, loading it the first time */
	function play(host: HTMLElement, id: string) {
		const video = host.querySelector<HTMLVideoElement>('.clip');
		if (!video || !clips[id] || !autoplay) return;

		if (!video.src) video.src = clips[id];

		// shown once it moves, so one still loading never covers the screenshot with a blank frame
		video.addEventListener(
			'playing',
			() => {
				if (video.paused) return;
				host.dataset.playing = '';
			},
			{ once: true }
		);
		video.play().catch(() => {});
	}

	/** whether anything moves on its own, which the button at the start of the page turns off */
	let autoplay = $state(true);

	/**
	 * the hero is on screen, where on phones the floating button would cover the carousel's own
	 * buttons, so it gives way to one under the carousel
	 */
	let hero_seen = $state(true);

	const watch_hero: Attachment<HTMLElement> = (node) => {
		const observer = new IntersectionObserver(([entry]) => (hero_seen = entry.isIntersecting));
		observer.observe(node);
		return () => observer.disconnect();
	};

	/** the screenshots with clips that are mostly in the window */
	const visible = new Set<HTMLElement>();

	let viewing: IntersectionObserver | undefined;
	const view_ids = new WeakMap<Element, string>();
	const waiting = new WeakMap<Element, ReturnType<typeof setTimeout>>();

	/**
	 * plays the clip of each screenshot that is mostly in the window, and stops it once it is
	 * mostly out. a moment late, so scrolling past loads nothing
	 */
	function in_view(id: string) {
		return (node: HTMLElement) => {
			viewing ??= new IntersectionObserver(
				(entries) => {
					const moving =
						matchMedia('(prefers-reduced-motion: no-preference)').matches &&
						!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection
							?.saveData;

					for (const entry of entries) {
						const host = entry.target as HTMLElement;

						// most of it, or most of the window where it is taller than that
						const shown = entry.intersectionRect.height;
						const whole = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? 0);
						const inside = entry.isIntersecting && shown >= whole * 0.6;

						clearTimeout(waiting.get(host));

						if (inside) {
							visible.add(host);
							if (moving && autoplay) {
								waiting.set(
									host,
									setTimeout(() => play(host, view_ids.get(host)!), 300)
								);
							}
						} else {
							visible.delete(host);
							release(host);
						}
					}
				},
				{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
			);

			view_ids.set(node, id);
			viewing.observe(node);

			return () => {
				viewing?.unobserve(node);
				visible.delete(node);
				clearTimeout(waiting.get(node));
			};
		};
	}

	function toggle_autoplay() {
		autoplay = !autoplay;

		// remembered, so it stays paused on the next visit
		try {
			if (autoplay) localStorage.removeItem('showcase:paused');
			else localStorage.setItem('showcase:paused', '1');
		} catch {}

		if (!autoplay) {
			for (const host of document.querySelectorAll<HTMLElement>('[data-playing]')) stop(host);
		} else if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
			for (const host of visible) play(host, view_ids.get(host)!);
		}
	}

	/** plays the clip of a site as the keyboard reaches it */
	function focus_clip(host: HTMLElement, id: string) {
		if (matchMedia('(prefers-reduced-motion: no-preference)').matches) play(host, id);
	}

	/** stops a clip once pointed away from or left, unless it is still in the window */
	function release(host: HTMLElement) {
		if (!visible.has(host) && !host.matches(':hover') && !host.closest(':focus')) stop(host);
	}

	/** the screenshot in a link */
	function thumb_of(event: FocusEvent) {
		return (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.thumb')!;
	}

	function stop(host: HTMLElement) {
		const video = host.querySelector<HTMLVideoElement>('.clip');
		if (!video) return;

		delete host.dataset.playing;
		video.pause();

		// from the start next time, once it has faded out
		setTimeout(() => {
			if (host.dataset.playing === undefined) video.currentTime = 0;
		}, 300);
	}

	function swap(img: HTMLImageElement, id: string, loaded: () => void) {
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
				// moving a couple of frames after the whole screenshot is in place, so that it has been
				// laid out at its full height first
				img.addEventListener(
					'load',
					() => {
						img.dataset.long = 'loaded';
						requestAnimationFrame(() => requestAnimationFrame(loaded));
					},
					{ once: true }
				);

				for (const source of sources) {
					source.srcset = picture.sources[source.type.replace('image/', '')] ?? source.srcset;
				}
				img.src = picture.img.src;
			});
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

		// and to the screenshot from a clip playing over it
		const clip = source.querySelector<HTMLVideoElement>('.clip');
		if (clip) {
			clip.pause();
			clip.style.transition = 'none';
			clip.style.opacity = '0';
		}

		// where it starts from, as the browser captures it, since starting from wherever the browser's
		// own animation of it happens to be leaves it starting at the end when that is not yet running
		const from = source.getBoundingClientRect();

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
			if (clip) {
				clip.style.transition = clip.style.opacity = '';
				stop(source);
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
				transform: [
					`translate(${from.left}px, ${from.top}px)`,
					`translate(${to.left}px, ${to.top}px)`
				],
				width: [`${from.width}px`, `${to.width}px`],
				height: [`${from.height}px`, `${to.height}px`]
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

		// shows the tick for a keyboard press too, which never makes the button :active, for a frame,
		// after which it fades back as it does once a pointer lets go
		flash = true;
		requestAnimationFrame(() => requestAnimationFrame(() => (flash = false)));
	}
</script>

<svelte:head>
	<title>Showcase • Svelte</title>

	<meta name="twitter:title" content="Showcase • Svelte" />
	<meta name="twitter:description" content="Websites built with Svelte and SvelteKit" />
	<meta name="description" content="Websites built with Svelte and SvelteKit" />
</svelte:head>

{#snippet screenshot(id: string, sizes: string, loading: 'eager' | 'lazy', clip = false)}
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
	{#if clip && clips[id]}
		<!-- loaded only once it plays, by play() -->
		<video
			class="clip"
			muted
			loop
			playsinline
			disablepictureinpicture
			disableremoteplayback
			preload="none"
			aria-hidden="true"
		></video>
	{/if}
{/snippet}

{#snippet pause(where: 'float' | 'inline')}
	<button
		class={['autoplay', where, { tucked: where === 'float' && hero_seen }]}
		onclick={toggle_autoplay}
	>
		<!-- both, one over the other, so one can turn into the other -->
		<span class="glyph" aria-hidden="true">
			<svg class={{ off: !autoplay }} viewBox="0 0 16 16" width="16" height="16">
				<path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
			</svg>
			<svg class={{ off: autoplay }} viewBox="0 0 16 16" width="16" height="16">
				<path d="M4 2.2v11.6L13.5 8z" />
			</svg>
		</span>
		<!-- both, one over the other with only the one that applies showing, so the button is as wide
		     either way -->
		<span class="wording">
			<span class={{ off: !autoplay }}>Pause motion</span>
			<span class={{ off: autoplay }}>Play motion</span>
		</span>
	</button>
{/snippet}

{#snippet carousel_pause()}
	{@render pause('inline')}
{/snippet}

{#snippet tile(
	site: Site,
	size: Tile['size'],
	sizes: string,
	{ text = true, right = false, fill = undefined as Tile['fill'], still = false, style = '' } = {}
)}
	<!-- a still one, as in the many more, never loads anything more on hover or focus, to save
	     data: no whole screenshot to scroll down, and no clip that scrolls down the page -->
	{@const moves = clips[site.id] && !(still && scrolling.has(site.id))}
	<li
		class={['site', size, { right }, fill && `fill-${fill}`]}
		id={site.id}
		{style}
		style:--position={site.screenshot?.position}
		style:--placeholder={placeholders[site.id]}
	>
		<a
			class="tile"
			href={site.url}
			onpointerenter={(event) => (still ? moves : true) && lengthen(event, site.id)}
			onfocus={(event) => moves && focus_clip(thumb_of(event), site.id)}
			onblur={(event) => moves && release(thumb_of(event))}
			{@attach fade_in}
		>
			<span
				class="thumb"
				{@attach clips[site.id] && !scrolling.has(site.id) ? in_view(site.id) : undefined}
			>
				{#if pictures[site.id]}
					{@render screenshot(site.id, sizes, 'lazy', !!moves)}
				{/if}

				{#if !text}
					<!-- over the screenshot, shown as you point at, focus or tap it -->
					<span class="label">{site.name}</span>
				{/if}
			</span>

			{#if text}
				<span class="text">
					<span class="name">{site.name}</span>
					<span class="description" lang={site.lang}>{site.description}</span>
				</span>
			{/if}
		</a>
	</li>
{/snippet}

<div
	class="showcase"
	{@attach () => {
		try {
			if (localStorage.getItem('showcase:paused')) autoplay = false;
		} catch {}
	}}
>
	<!-- first, so the keyboard reaches it before anything that moves, and always there, so clips
	     can be stopped before they start -->
	{#if Object.keys(clips).length > 0 || ring.length > 0}
		{@render pause('float')}
	{/if}

	<div
		class={['hero', { arrive }]}
		{@attach watch_hero}
		{@attach () => {
			arrived = true;
		}}
	>
		<div class="intro">
			<h1>Built with <span>Svelte</span></h1>
			<p>From newsrooms to public services, popular brands and leading industries</p>
		</div>

		{#if ring.length > 0}
			<Carousel
				cards={ring}
				{autoplay}
				{arrive}
				sizes={card_sizes}
				onpick={morph}
				onprime={prime}
				controls={carousel_pause}
			/>
		{/if}
	</div>

	<nav class="categories" aria-label="Categories">
		<ul>
			{#each sections as section (section.id)}
				<li>
					<a
						href="#{section.id}"
						onclick={(event) => section.lead && morph(event, section.lead.id)}
						onpointerenter={() => section.lead && prime(section.lead.id)}
						onfocus={() => section.lead && prime(section.lead.id)}
						{@attach fade_in}
					>
						<span class="title">{section.title}</span>

						{#if section.lead}
							<span
								class="sheet"
								aria-hidden="true"
								style:--position={section.lead.screenshot?.position}
								style:--placeholder={placeholders[section.lead.id]}
							>
								{@render screenshot(section.lead.id, '(min-width: 1024px) 200px, 120px', 'lazy')}
							</span>
						{/if}
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
					{#each section.tiles as { site, size, right, fill } (site.id)}
						{@render tile(site, size, sizes[fill ? 'big' : size], { right, fill })}
					{/each}
				</ul>
			</section>
		{/each}

		{#if extras.length > 0}
			<section class="category" aria-labelledby="also">
				<h2 id="also">And many more</h2>

				<!-- in rows across the whole width of the window, cut off at either side like the logos on
				     the home page -->
				<div class="crowd">
					<ul>
						{#each extras as site (site.id)}
							{@render tile(site, 'small', sizes.small, { text: false, still: true })}
						{/each}
					</ul>
				</div>
			</section>
		{/if}

		<section class="next" aria-labelledby="your-turn">
			<h2 id="your-turn">It’s your turn</h2>

			<p>
				Use our CLI to create a new project, or try our
				<a href="/tutorial">interactive tutorial</a>.
			</p>

			<div class="command">
				<code>{command}</code>

				<!-- the copy icon turning to a tick as it is pressed, and back a moment later, like the copy
				     buttons on the code in the docs -->
				<button
					class={['raised', 'icon', 'copy', { flash }]}
					title="Copy to clipboard"
					aria-label="Copy to clipboard"
					onclick={copy}
				></button>

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

	.site {
		position: relative;
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

	/* the categories like the contents of a magazine, each with the first few sites in it and the
	   screenshot of the first, as wide as the sites below so their edges line up */
	.categories {
		max-width: 140rem;
		margin: 0 auto;
		padding: 5.6rem var(--sk-page-padding-side) 0;

		@media (min-width: 1024px) {
			padding-top: 8rem;
		}

		ul {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			/* the same as between the sites, so the second column starts where theirs does */
			column-gap: 2.4rem;

			@media (min-width: 1280px) {
				column-gap: 3.2rem;
			}

			margin: 0;
			padding: 0;
			list-style: none;
			border-top: 1px solid var(--sk-border);

			@media (min-width: 740px) {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
		}

		li {
			border-bottom: 1px solid var(--sk-border);
		}

		a {
			display: grid;
			/* the screenshot first, so the column's ragged text, not a screenshot, meets the gap
			   between the columns, which is narrower than the one beside each screenshot would
			   otherwise look */
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-areas: 'sheet title';
			align-items: center;
			column-gap: 2.4rem;
			height: 100%;
			padding: 1.6rem 0;

			@media (min-width: 740px) {
				padding: 2.4rem 0;
			}

			color: var(--sk-fg-1);
			text-decoration: none;
		}
	}

	.title {
		grid-area: title;
		font: 400 clamp(2.4rem, 2rem + 0.8vw, 3.2rem) / 1.1 var(--sk-font-family-heading);
	}

	.sheet {
		position: relative;
		display: block;
		grid-area: sheet;
		width: 8rem;

		@media (min-width: 740px) {
			width: 12rem;
		}

		aspect-ratio: 16 / 10;
		overflow: hidden;
		border: 1px solid var(--sk-border);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);

		@media (min-width: 1024px) {
			width: 16rem;
		}
	}

	/* underlined on hover like links elsewhere on the site, the name only */
	.categories a:hover {
		text-decoration: none;

		.title {
			text-decoration: underline;
		}
	}

	/* underlined like links in text elsewhere on the site, since it sits among words that are not */
	.next p a {
		text-decoration: underline;
	}

	.index {
		max-width: 140rem;
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-bottom);
	}

	/* the screenshots grey towards the top and bottom of the window and in colour in a band across
	   the middle, by one layer of grey over each list blended in by saturation, which starts a window
	   above it and moves down with the page, so the band stays still in the window. one for each
	   list rather than each screenshot, so scrolling has few layers to redraw */
	@supports (animation-timeline: view()) {
		.index {
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
				background: linear-gradient(grey 15%, transparent 35% 55%, grey 75%) top / 100% 100vh
					no-repeat;
				mix-blend-mode: saturation;
				pointer-events: none;
				animation: stay-in-window linear both;
				animation-timeline: --list;
			}
		}

		/* and on each of the few screenshots of the categories rather than their list, which is over
		   the foot of the hero, so the page there stays clear */
		.sheet {
			isolation: isolate;
			view-timeline: --sheet;

			&::after {
				content: '';
				position: absolute;
				inset: -100vh 0 0;
				background: linear-gradient(grey 15%, transparent 35% 55%, grey 75%) top / 100% 100vh
					no-repeat;
				mix-blend-mode: saturation;
				pointer-events: none;
				animation: stay-in-window linear both;
				animation-timeline: --sheet;
			}

			a:is(:hover, :focus-visible) &::after {
				display: none;
			}
		}

		/* but the rows of the many more in colour all the way down, above the grey */
		.crowd {
			position: relative;
			z-index: 3;
		}

		/* and the one you point at or focus in colour wherever it is, above the grey */
		.index .site:has(.tile:is(:hover, :focus-visible)) {
			position: relative;
			z-index: 3;
		}
	}

	@keyframes stay-in-window {
		to {
			translate: 0 100%;
		}
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

	/* a mosaic, the first large and as many after it as wide as the rows need to come out even */
	/* one across on phones, two on small tablets, three on tablets and small laptops, by six columns
	   so a short last row can widen to fill, and four on wider screens. the large one takes a
	   square from three across up */
	.sites {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-auto-flow: dense;
		gap: 4rem 2.4rem;
		margin: 0;
		padding: 0;
		list-style: none;

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		@media (min-width: 740px) {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		@media (min-width: 1280px) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 5.6rem 3.2rem;
		}
	}

	.site {
		min-width: 0;
		scroll-margin-top: var(--anchor-offset);

		/* where three are across, two of the six columns each, the large one four columns and two rows
		   on alternate sides, and the one or two in a short last row widened to fill it */
		@media (min-width: 740px) and (max-width: 1279px) {
			grid-column: span 2;

			&.big {
				grid-column: span 4;
				grid-row: span 2;
			}

			&.big.right {
				grid-column: 3 / span 4;
			}

			&.fill-2 {
				grid-column: span 3;
			}

			&.fill-1 {
				grid-column: span 6;
			}
		}

		/* as large as two across and two down where there are four columns */
		@media (min-width: 1280px) {
			&.big {
				grid-column: span 2;
				grid-row: span 2;
			}

			&.big.right {
				grid-column: 3 / span 2;
			}
		}

		/* where it is large, taller than 16:10 to fill the rows it spans beside the smaller ones, so
		   the mosaic has no holes, about the 6:5 its clip and screenshot are taken at, so little of
		   them is cut, and elsewhere 16:10 like the rest, so the screenshots in a row line up. from
		   the top left like the rest, so what is cut is off the right, as a narrower window would,
		   rather than off both sides */
		@media (min-width: 740px) {
			&.big .tile {
				grid-template-rows: 1fr auto;
			}
		}
	}

	/* on phones, one after another */
	@media (max-width: 639px) {
		.sites {
			row-gap: 3.2rem;
		}
	}

	/* the screenshot, the name and description under it */
	.tile {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr;
		align-content: start;
		gap: 1.2rem;
		height: 100%;
		color: var(--sk-fg-1);
		text-decoration: none;
	}

	/* the name and description under the screenshot */
	.text {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;

		.name {
			font: 400 clamp(1.8rem, 1.5rem + 0.4vw, 2.2rem) / 1.15 var(--sk-font-family-heading);
		}

		.big & .name {
			@media (min-width: 740px) {
				font-size: clamp(2.4rem, 1.8rem + 1.2vw, 3.6rem);
			}
		}

		.description {
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
		}

		.big & .description {
			@media (min-width: 740px) {
				font: var(--sk-font-body);
			}
		}
	}

	/* the name only, as links elsewhere on the site, rather than the description too */
	.tile:hover {
		text-decoration: none;

		.text .name {
			text-decoration: underline;
		}
	}

	.thumb {
		/* pressed in a little as it is clicked, felt before the page leaves for the site */
		transition: scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

		.tile:active & {
			scale: 0.98;
		}

		position: relative;
		grid-area: 1 / 1;
		display: block;
		overflow: hidden;
		color: #fff;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);

		/* 16:10 by padding, so the big ones can be as tall as their rows instead */
		&::before {
			content: '';
			display: block;
			padding-top: 62.5%;
		}
	}

	/* the name over the bottom of the screenshot, only on the one you point at, focus or tap */
	.label {
		position: absolute;
		inset: auto 0 0;
		z-index: 1;
		padding: 3.2rem 1.2rem 1rem;
		font: 400 clamp(1.6rem, 1.4rem + 0.4vw, 2rem) / 1.1 var(--sk-font-family-heading);
		background: linear-gradient(transparent, rgb(0 0 0 / 0.65));
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease;

		.tile:is(:focus-visible, :active) & {
			opacity: 1;
		}

		@media all and not (hover: none) {
			.tile:hover & {
				opacity: 1;
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
		transition: opacity 0.25s var(--quint-out);
	}

	.slide {
		position: absolute;
		inset: 0;
		display: block;
	}

	/* over the screenshot, faded in once it moves and out as the pointer leaves */
	.clip {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--position, left top);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
	}

	/* in a little slower than it goes */
	.thumb:global([data-playing]) > .clip {
		opacity: 1;
		transition-duration: 0.2s;
	}

	/* where motion is reduced clips never play, so there is nothing for it to stop */
	.wording {
		display: grid;

		> span {
			grid-area: 1 / 1;
		}

		/* hidden from screen readers too, so the button is named by the one showing */
		.off {
			visibility: hidden;
		}
	}

	.autoplay {
		@media (prefers-reduced-motion: reduce) {
			display: none;
		}

		position: fixed;
		right: 1.6rem;
		bottom: calc(1.6rem + env(safe-area-inset-bottom));
		z-index: 10;

		/* above the banner, which sits at the bottom of wider windows */
		@media (min-width: 832px) {
			bottom: calc(1.6rem + var(--sk-banner-height) + env(safe-area-inset-bottom));
		}
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.8rem 1.4rem;
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-1);
		background: var(--sk-bg-2);
		border: 1px solid var(--sk-border);
		border-radius: 10rem;
		box-shadow: 0 0.2rem 0.8rem rgb(0 0 0 / 0.15);

		/* pressed in a little, so it is felt to take the press */
		transition: scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

		&:active {
			scale: 0.97;
		}

		.glyph {
			display: grid;
		}

		svg {
			grid-area: 1 / 1;
			fill: currentColor;
			transition:
				opacity 0.15s ease,
				scale 0.15s ease,
				filter 0.15s ease;

			&.off {
				opacity: 0;
				scale: 0.8;
				filter: blur(2px);
			}
		}

		/* only the icon on phones, a round button, with its name still read out */
		@media (max-width: 739px) {
			justify-content: center;
			width: 4.4rem;
			height: 4.4rem;
			padding: 0;

			.wording {
				position: absolute;
				width: 1px;
				height: 1px;
				overflow: hidden;
				clip-path: inset(50%);
				white-space: nowrap;
			}
		}

		/* on phones, out of the way of the carousel while the hero shows, which has its own. back in
		   rising a little as the hero leaves, and out with a quicker fade alone */
		@media (max-width: 739px) {
			&.float {
				transition:
					opacity 0.2s var(--quint-out),
					transform 0.2s var(--quint-out),
					visibility 0s,
					translate 0.2s,
					scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			}

			&.tucked {
				opacity: 0;
				transform: translateY(0.8rem);
				visibility: hidden;
				transition:
					opacity 0.12s ease,
					transform 0s 0.12s,
					visibility 0s 0.12s,
					translate 0.2s,
					scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			}
		}

		/* under the carousel, on phones only, with its name, in the flow rather than over it */
		&.inline {
			display: none;

			@media (max-width: 739px) and (prefers-reduced-motion: no-preference) {
				display: flex;
				position: static;
				grid-column: 1 / -1;
				justify-self: center;
				/* clear of the taller tap areas of the marks above it */
				margin-top: 1.6rem;
				width: auto;
				padding: 0 1.6rem;
				box-shadow: none;

				.wording {
					position: static;
					display: grid;
					width: auto;
					height: auto;
					overflow: visible;
					clip-path: none;
				}
			}
		}

		/* on small screens the nav is at the bottom, sliding away as the page scrolls down and back as
		   it scrolls up, so the button moves up over it while it shows, as quickly as it slides */
		@media (max-width: 831px) {
			transition:
				translate 0.2s,
				scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

			:global(body:has(nav:is(.visible, :focus-within))) &.float {
				translate: 0 calc(-1 * var(--sk-nav-height));
			}
		}
	}

	/* the whole screenshot at its full height once it loads in place of the top of it, for the
	   glance down it on hover */
	.thumb .slide > .image:global([data-long='loaded']) {
		height: auto;
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

	/* as the copy buttons on the code in the docs do it: the tick in place of the copy icon at once
	   as it is pressed, fading back to the copy icon a moment after it is let go */
	.copy {
		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: currentColor;
			mask: no-repeat 50% 50% / 1.6rem 1.6rem;
			transition: opacity 0.2s;
			transition-delay: 0.6s;
		}

		&::before {
			mask-image: url(icons/copy-to-clipboard);
		}

		&::after {
			mask-image: url(icons/check);
			opacity: 0;
		}

		&:is(:active, .flash)::before {
			opacity: 0;
			transition: none;
		}

		&:is(:active, .flash)::after {
			opacity: 1;
			transition: none;
		}
	}

	/* as many across as fit in the window with part of one cut off at either side, faded out
	   towards the edges, all the same size and centred */
	.crowd {
		--across: 3;
		--gap: 1.2rem;
		/* half of one more across than the window holds, so with each row shifted a quarter of a
		   step either way, the one cut off at the end of a row still shows at least half */
		--width: calc(100vw / (var(--across) - 0.5) - var(--gap));

		margin-inline: calc(50% - 50vw);
		overflow-x: clip;
		/* the rows centred in the window, though wider than it */
		display: flex;
		justify-content: center;
		mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);

		@media (min-width: 640px) {
			--across: 4;
			--gap: 1.6rem;
		}

		@media (min-width: 1024px) {
			--across: 6;
		}

		/* in rows as wide as that many, with the last row centred under the rest if it is short */
		ul {
			display: flex;
			flex: none;
			flex-wrap: wrap;
			justify-content: center;
			width: calc(var(--across) * var(--width) + (var(--across) - 1) * var(--gap));
			gap: var(--gap);
			margin: 0;
			padding: 0;
			list-style: none;
		}

		/* sized by the list item rather than the screenshot, which Safari otherwise redraws with a
		   flicker while scrolling. every other row a quarter of a step to the left and the rest a
		   quarter to the right, so they are offset from each other by half of one, with at least
		   half of the one at either end showing */
		li {
			--shift: 1;
			width: var(--width);
			container-type: inline-size;
			translate: calc(var(--shift) * (var(--width) + var(--gap)) / 4) 0;

			@media (max-width: 639px) {
				&:is(:nth-child(6n + 1), :nth-child(6n + 2), :nth-child(6n + 3)) {
					--shift: -1;
				}
			}

			@media (min-width: 640px) and (max-width: 1023px) {
				&:is(:nth-child(8n + 1), :nth-child(8n + 2), :nth-child(8n + 3), :nth-child(8n + 4)) {
					--shift: -1;
				}
			}

			@media (min-width: 1024px) {
				&:is(
					:nth-child(12n + 1),
					:nth-child(12n + 2),
					:nth-child(12n + 3),
					:nth-child(12n + 4),
					:nth-child(12n + 5),
					:nth-child(12n + 6)
				) {
					--shift: -1;
				}
			}
		}

		/* and a short last row not shifted either way, so it is centred under the rest */
		li {
			@media (max-width: 639px) {
				&:nth-child(3n + 1):nth-last-child(-n + 2),
				&:nth-child(3n + 1):nth-last-child(-n + 2) ~ li {
					--shift: 0;
				}
			}

			@media (min-width: 640px) and (max-width: 1023px) {
				&:nth-child(4n + 1):nth-last-child(-n + 3),
				&:nth-child(4n + 1):nth-last-child(-n + 3) ~ li {
					--shift: 0;
				}
			}

			@media (min-width: 1024px) {
				&:nth-child(6n + 1):nth-last-child(-n + 5),
				&:nth-child(6n + 1):nth-last-child(-n + 5) ~ li {
					--shift: 0;
				}
			}
		}

		/* and none left alone on a row of its own at the end, which looks stranded */
		li:last-child {
			@media (max-width: 639px) {
				&:nth-child(3n + 1) {
					display: none;
				}
			}

			@media (min-width: 640px) and (max-width: 1023px) {
				&:nth-child(4n + 1) {
					display: none;
				}
			}

			@media (min-width: 1024px) {
				&:nth-child(6n + 1) {
					display: none;
				}
			}
		}

		/* only the screenshot, with no row for text below it to add to the gap */
		.tile {
			gap: 0;
		}

		/* smaller type in the smaller ones */
		@container (width < 20rem) {
			.label {
				padding: 2.4rem 0.8rem 0.6rem;
				font-size: 1.6rem;
			}
		}
	}
</style>
