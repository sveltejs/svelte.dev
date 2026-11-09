<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import { tick, untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { Snippet } from 'svelte';
	import type { Site } from './sites.ts';

	interface Card {
		site: Site;
		/** the top of the screenshot, or the part of it given by the site's position */
		picture: Picture;
		/** the tiny screenshot shown blurred until it loads */
		placeholder?: string;
		clip?: string;
	}

	interface Props {
		cards: Card[];
		/** whether anything moves on its own, which the button at the start of the page turns off */
		autoplay: boolean;
		/** spins in from the side, on the first visit only */
		arrive: boolean;
		sizes: string;
		/** a click on the card in front, which goes to the site in the list */
		onpick: (event: MouseEvent, id: string) => void;
		/** a pointer or the keyboard reaching the card in front, before it may be picked */
		onprime: (id: string) => void;
		/** more controls under the marks, such as one that pauses everything where there is no room */
		controls?: Snippet;
	}

	let { cards, autoplay, arrive, sizes, onpick, onprime, controls }: Props = $props();

	/** how long one without a clip stays in front before the carousel moves on, in milliseconds */
	const DWELL = 5000;

	/**
	 * how long a turn of one card takes: unhurried when it moves on by itself, and quicker when
	 * turned by hand, so it keeps up with the hand. both on the same strong ease-out
	 */
	const ON_ITS_OWN = 700;
	const BY_HAND = 450;

	const count = $derived(cards.length);

	/**
	 * where the cards stand by how far they are from the front, the arc of the hero before it
	 * turned: x in percent across, z in pixels toward the viewer and r in degrees turned. those to
	 * the left are the same mirrored, and one between two places is between them
	 */
	const SLOTS = [
		{ x: 50, z: 0, r: 0 },
		{ x: 86, z: -180, r: -28 },
		{ x: 110, z: -420, r: -38 },
		// out of sight, where those further round wait
		{ x: 128, z: -700, r: -44 }
	];

	function place(o: number) {
		const d = Math.min(Math.abs(o), SLOTS.length - 1);
		const i = Math.min(Math.floor(d), SLOTS.length - 2);
		const t = d - i;
		const [a, b] = [SLOTS[i], SLOTS[i + 1]];
		const sign = o < 0 ? -1 : 1;
		return {
			x: 50 + sign * (a.x - 50 + (b.x - a.x) * t),
			z: a.z + (b.z - a.z) * t,
			r: sign * (a.r + (b.r - a.r) * t)
		};
	}

	/**
	 * where the ring has turned to, in cards rather than degrees, and never wrapped, so it can keep
	 * turning either way for ever. a whole number when one card is in front
	 */
	// starting to one side only on the first visit, which the prop never changes after
	const turn = new Tween(untrack(() => arrive) ? -1.6 : 0, { duration: 700, easing: quintOut });

	/**
	 * spinning in to the first card, which is named below from the start rather than whichever it
	 * starts from
	 */
	let arriving = $state(untrack(() => arrive));

	/** the card in front, or nearest to it while turning */
	const current = $derived(wrap(Math.round(turn.current)));

	/** where the ring is turning to, which decides the card named below it */
	const target = $derived(arriving ? 0 : wrap(Math.round(turn.target)));

	/** the ring has come to rest on the one in front */
	const settled = $derived(turn.current === turn.target);

	/** how far through its time in front a card is, from 0 to 1, for its mark below */
	let progress = $state.raw({ i: -1, value: 0 });

	/** the one in front's progress, or none for one only just come to the front */
	const shown_progress = $derived(progress.i === target ? progress.value : 0);

	/** how long each with no clip has been in front so far, kept while it is held */
	const elapsed = new Map<number, number>();

	/** the clip that has started to move, so it can show over its screenshot */
	let playing = $state(-1);

	/** turned by a hand on it, so it says where it lands */
	let touched = $state(false);

	/**
	 * the keyboard is in it, or a hand is holding it, which stops it turning on its own. not a
	 * mouse resting on it or a click on its buttons, after which it carries on
	 */
	let focused = $state(false);
	let dragging = $state(false);

	/** the ring is on screen, and the page is the tab showing */
	let seen = $state(true);
	let shown = $state(true);

	/** whether it is allowed to turn and play on its own at all */
	const moving = $derived(autoplay && !prefersReducedMotion.current);

	/** whether it should be turning on its own right now */
	const running = $derived(moving && seen && shown && !focused && !dragging);

	function wrap(i: number) {
		return ((i % count) + count) % count;
	}

	/**
	 * how far a card is from the front, in cards, to the right if more than 0 and the left if less,
	 * whichever way round is shorter
	 */
	function offset(i: number, at: number) {
		const ahead = (((i - at) % count) + count) % count;
		return ahead > count / 2 ? ahead - count : ahead;
	}

	/** turns to the card a given number away, by the shortest way round */
	function go(by: number, duration = BY_HAND) {
		const to = Math.round(turn.target) + by;
		turn.set(to, { duration: prefersReducedMotion.current ? 0 : duration, easing: quintOut });
	}

	/** turns to a given card by the shortest way round */
	function show(i: number) {
		const from = Math.round(turn.target);
		let by = wrap(i - from);
		if (by > count / 2) by -= count;
		if (by !== 0) {
			touched = true;
			go(by);
		}
	}

	/** on the first visit, spins in to the first card */
	const spin_in: Attachment = () => {
		untrack(() => {
			if (arrive) {
				turn.set(0, { duration: prefersReducedMotion.current ? 0 : 1600, easing: quintOut });
				arriving = false;
			}
		});
	};

	/**
	 * where motion is reduced the cards change places at once, so the arc dims for a moment as they
	 * do, to show that they have
	 */
	let dimmed_for = -1;

	const dim: Attachment<HTMLElement> = (node) => {
		const now = target;
		if (now === dimmed_for) return;
		const first = dimmed_for === -1;
		dimmed_for = now;

		if (!first && untrack(() => prefersReducedMotion.current)) {
			node.animate({ opacity: [1, 0.6, 1] }, { duration: 200, easing: 'ease' });
		}
	};

	/** only turns on its own while it is on screen */
	const watch: Attachment<HTMLElement> = (node) => {
		const observer = new IntersectionObserver(([entry]) => (seen = entry.isIntersecting));
		observer.observe(node);
		return () => observer.disconnect();
	};

	/**
	 * a card in front plays its clip once the ring has stopped on it, and the ring moves on once the
	 * clip ends, or after a while for one with none. any other stops its clip, back to its start
	 */
	function turn_on(i: number): Attachment<HTMLElement> {
		return (node) => {
			const video = node.querySelector('video');
			const clip = cards[i].clip;

			if (i !== target) {
				elapsed.delete(i);
				if (video) {
					video.pause();
					video.currentTime = 0;
				}
				return;
			}

			if (!settled || !moving) {
				video?.pause();
				return;
			}

			// held where it is, still playing if it was, until let go
			if (!running) return;

			const next = () => go(1, ON_ITS_OWN);

			if (video && clip) {
				if (!video.src) video.src = clip;

				// on after a while anyway if it will not play, or is too slow to start
				let fallback = setTimeout(next, DWELL);
				const started = () => {
					clearTimeout(fallback);
					const left = (video.duration - video.currentTime) * 1000;
					fallback = setTimeout(next, Math.max(left, 0) + 1000);
				};

				video.addEventListener('ended', next, { once: true });
				// already going, if it was held while playing and has just been let go
				if (!video.paused && video.duration) started();
				else video.addEventListener('playing', started, { once: true });
				video.play().catch(() => {});

				return () => {
					clearTimeout(fallback);
					video.removeEventListener('ended', next);
					video.removeEventListener('playing', started);
				};
			}

			// on from where it was, if it was held
			const start = performance.now() - (elapsed.get(i) ?? 0);
			const timer = setInterval(() => {
				const so_far = performance.now() - start;
				elapsed.set(i, so_far);
				progress = { i, value: Math.min(so_far / DWELL, 1) };
				if (so_far >= DWELL) next();
			}, 100);

			return () => clearInterval(timer);
		};
	}

	/** where a drag started, and the ring's turn then, and how quickly it is going */
	let drag:
		| {
				id: number;
				x: number;
				y: number;
				from: number;
				width: number;
				moved: boolean;
				samples: Array<{ t: number; at: number }>;
		  }
		| undefined;

	/** set after a drag, so the click that follows on letting go does not open the card */
	let dragged = false;

	function down(event: PointerEvent) {
		if (event.button !== 0) return;
		const card = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.card');
		drag = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			from: turn.current,
			width: card?.offsetWidth || 400,
			moved: false,
			samples: [{ t: event.timeStamp, at: turn.current }]
		};
		dragged = false;
	}

	function move(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;

		const dx = event.clientX - drag.x;
		const dy = event.clientY - drag.y;

		if (!drag.moved) {
			// up and down is the page scrolling, not the ring turning
			if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) {
				if (Math.abs(dy) > 10) drag = undefined;
				return;
			}
			drag.moved = true;
			dragging = true;
			touched = true;
			try {
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
			} catch {
				// the pointer has already gone
			}
		}

		// a card's width across turns it by a card, so the one in front stays under the finger
		const at = drag.from - dx / drag.width;
		turn.set(at, { duration: 0 });

		drag.samples.push({ t: event.timeStamp, at });
		if (drag.samples.length > 5) drag.samples.shift();
	}

	function up(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;
		const { moved, samples, from } = drag;
		drag = undefined;
		dragging = false;
		if (!moved) return;

		dragged = true;

		// thrown on by however fast it was going as it was let go, landing on a card
		const first = samples[0];
		const last = samples[samples.length - 1];
		const elapsed = Math.max(last.t - first.t, 1);
		const velocity = (last.at - first.at) / elapsed; // cards per millisecond
		const fresh = event.timeStamp - last.t < 80;
		const thrown = fresh ? Math.max(-4, Math.min(4, velocity * 400)) : 0;

		let to = Math.round(turn.current + thrown);
		// at least on to the next in the direction of a quick flick
		if (to === Math.round(from) && Math.abs(velocity) > 0.002) {
			to = velocity > 0 ? Math.ceil(turn.current) : Math.floor(turn.current);
		}

		// as long as it takes to start off as fast as it was thrown, since the curve starts five
		// times as fast as its average, so it carries on from the hand without a lurch or a stall
		const distance = Math.abs(to - turn.current);
		const speed = Math.abs(velocity);
		const duration = fresh && speed > 0.0005 ? (5 * distance) / speed : BY_HAND;

		turn.set(to, {
			duration: prefersReducedMotion.current ? 0 : Math.max(300, Math.min(700, duration)),
			easing: quintOut
		});
	}

	/**
	 * sideways scrolling on a trackpad turns it with the fingers, as far as they and the momentum
	 * after them go, landing on the nearest card once it stops
	 */
	let wheel_timer: ReturnType<typeof setTimeout> | undefined;

	function wheel(event: WheelEvent) {
		if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
		event.preventDefault();

		const stage = event.currentTarget as HTMLElement;
		const width = stage.querySelector<HTMLElement>('.card')?.offsetWidth || 400;
		// in lines rather than pixels in some browsers with a mouse wheel
		const pixels = event.deltaMode === 1 ? event.deltaX * 16 : event.deltaX;

		touched = true;
		dragging = true;
		turn.set(turn.current + pixels / width, { duration: 0 });

		clearTimeout(wheel_timer);
		wheel_timer = setTimeout(() => {
			dragging = false;
			turn.set(Math.round(turn.current), {
				duration: prefersReducedMotion.current ? 0 : BY_HAND,
				easing: quintOut
			});
		}, 120);
	}

	/**
	 * the arrow keys turn it from anywhere in it. on the marks, which are one stop in the tab order,
	 * the focus follows to the mark of the one coming to the front
	 */
	async function key(event: KeyboardEvent) {
		const by = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
		if (by === 0) return;

		event.preventDefault();
		touched = true;
		go(by);

		const steps = (event.target as HTMLElement).closest('.steps');
		if (steps) {
			await tick();
			steps.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
		}
	}

	function click(event: MouseEvent, i: number) {
		if (dragged) {
			event.preventDefault();
			dragged = false;
			return;
		}

		// one to the side comes to the front, rather than opening, unless it is the one the ring is
		// already turning to, so a click as it moves on by itself still opens what is in front
		if (i !== current && i !== target) {
			event.preventDefault();
			show(i);
			return;
		}

		onpick(event, cards[i].site.id);
	}
</script>

<svelte:document onvisibilitychange={() => (shown = document.visibilityState === 'visible')} />

<!-- the arrow keys, from the links and buttons inside it, which is where they come from -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	class="carousel"
	aria-roledescription="carousel"
	aria-label="Sites built with Svelte"
	{@attach spin_in}
	onkeydown={key}
	onfocusin={(event) => (focused = (event.target as HTMLElement).matches(':focus-visible'))}
	onfocusout={(event) => {
		if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
			focused = false;
		}
	}}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="stage"
		{@attach watch}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onwheel={wheel}
	>
		<div class="space" {@attach dim}>
			{#each cards as { site, picture, placeholder, clip }, i (site.id)}
				{@const o = offset(i, turn.current)}
				{@const d = Math.abs(o)}
				{@const front = i === current}
				{@const at = place(o)}
				{@const grey = Math.min(d, 1)}
				<!-- out of the tab order and hidden from screen readers, since the name below links to the
				     same place and the buttons turn it -->
				<a
					class={['card', { front }]}
					href="#{site.id}"
					draggable="false"
					tabindex="-1"
					aria-hidden="true"
					style:transform="translate(-50%, -50%) translate3d({at.x - 50}cqw, 0, {at.z}px) rotateY({at.r}deg)"
					style:opacity={d > 2 ? 1 - Math.min(1, d - 2) : undefined}
					style:filter={settled && front
						? undefined
						: `saturate(${1 - grey * 0.9}) brightness(${1 - grey * 0.12})`}
					style:visibility={d >= 3 ? 'hidden' : undefined}
					style:--position={site.screenshot?.position}
					style:--placeholder={placeholder}
					onclick={(event) => click(event, i)}
					{@attach turn_on(i)}
					onpointerenter={() => front && onprime(site.id)}
				>
					<span class={['face', { playing: settled && playing === i }]}>
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
								draggable="false"
								loading={d < 2.5 ? 'eager' : 'lazy'}
							/>
						</picture>

						{#if clip}
							<!-- loaded only once it comes to the front -->
							<video
								class="clip"
								muted
								playsinline
								disablepictureinpicture
								disableremoteplayback
								preload="none"
								aria-hidden="true"
								onplaying={(event) => {
									if (!event.currentTarget.paused && i === target) playing = i;
								}}
								onpause={() => playing === i && (playing = -1)}
								ontimeupdate={(event) => {
									const { currentTime, duration } = event.currentTarget;
									if (i === target && duration) progress = { i, value: currentTime / duration };
								}}
							></video>
						{/if}
					</span>
					<span class="visually-hidden">{site.name}</span>
				</a>
			{/each}
		</div>
	</div>

	<div class="caption">
		{@render controls?.()}

		<button class="turn" aria-label="Previous site" onclick={() => ((touched = true), go(-1))}>
			<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
				<path d="M10 3 5 8l5 5" />
			</svg>
		</button>

		<!-- read out only when turned by hand, rather than every few seconds -->
		<p class="name" aria-live={touched ? 'polite' : 'off'}>
			{#key target}
				<a
					href="#{cards[target].site.id}"
					onclick={(event) => onpick(event, cards[target].site.id)}
					onpointerenter={() => onprime(cards[target].site.id)}
					onfocus={() => onprime(cards[target].site.id)}
				>
					{cards[target].site.name}
				</a>
			{/key}
		</p>

		<button class="turn" aria-label="Next site" onclick={() => ((touched = true), go(1))}>
			<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
				<path d="m6 3 5 5-5 5" />
			</svg>
		</button>

		<!-- one mark for each, the one in front filling as it plays, like the pages of a story -->
		<ol class="steps">
			{#each cards as { site }, i (site.id)}
				<li>
					<button
						class="step"
						aria-label={site.name}
						aria-current={i === target}
						tabindex={i === target ? 0 : -1}
						style:--progress={i !== target ? 0 : moving ? shown_progress : 1}
						onclick={() => show(i)}
					></button>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.carousel {
		position: relative;
		margin-top: 2.4rem;
	}

	/* the arc of cards, kept together in wide windows, its sides running off narrow ones */
	.stage {
		position: relative;
		height: clamp(18rem, 46vw, 38rem);
		max-width: 120rem;
		margin-inline: auto;
		perspective: 100rem;
		/* the width the cards are placed across, in cqw */
		container-type: inline-size;
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		cursor: grab;

		&:active {
			cursor: grabbing;
		}
	}

	/* passed through to the cards, since the cards to the side are further back than it and it
	   would otherwise take their clicks */
	.space {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		pointer-events: none;
	}

	/* each in its place in the arc, losing its colour and dimming a little away from the front, and
	   fading out as it goes round the back */
	.card {
		position: absolute;
		left: 50%;
		top: 50%;
		display: block;
		width: clamp(20rem, 60vw, 44rem);
		aspect-ratio: 16 / 10;
		/* placed, faded and greyed by its style, set directly rather than by properties its contents
		   would inherit and work out again on every frame. none on the one in front once it rests,
		   which safari would otherwise stop drawing its clip under */
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		pointer-events: auto;
		-webkit-tap-highlight-color: transparent;

		/* the one in front opens, which the hand over the rest of the ring would not say */
		&.front {
			cursor: pointer;
		}
	}

	.face {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: var(--sk-border-radius);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);
		box-shadow: 0.2rem 0.6rem 2.4rem rgb(0 0 0 / 0.22);
		transition: scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

		/* pressed in a little as the one in front is clicked, felt before it moves to the list. the
		   face rather than the card, so the card stays put under the pointer */
		.card.front:active & {
			scale: 0.97;
		}
	}

	.slide {
		position: absolute;
		inset: 0;
		display: block;
	}

	.image,
	.clip {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--position, left top);
		pointer-events: none;
	}

	/* over the screenshot once it moves, which it starts on, so the two meet without a jump */
	.clip {
		opacity: 0;
		transition: opacity 0.2s var(--quint-out);

		.playing & {
			opacity: 1;
		}
	}

	/* the name of the one in front, between the buttons that turn the carousel */
	.caption {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1.6rem;
		width: min(100% - 2 * var(--sk-page-padding-side), 48rem);
		margin: 0.8rem auto 0;
	}

	.name {
		display: grid;
		margin: 0;
		text-align: center;
		font: 400 clamp(2rem, 1.6rem + 0.8vw, 2.8rem) / 1.2 var(--sk-font-family-heading);

		a {
			grid-area: 1 / 1;
			color: var(--sk-fg-1);
			text-decoration: none;
			animation: name-in 0.25s var(--quint-out);

			&:hover {
				text-decoration: underline;
			}

			@media (prefers-reduced-motion: reduce) {
				animation: none;
			}
		}
	}

	.turn {
		display: grid;
		place-items: center;
		width: 4.4rem;
		height: 4.4rem;
		padding: 0;
		color: var(--sk-fg-2);
		background: none;
		border: 1px solid var(--sk-border);
		border-radius: 50%;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

		svg {
			fill: none;
			stroke: currentColor;
			stroke-width: 1.5;
			stroke-linecap: round;
			stroke-linejoin: round;
		}

		&:hover {
			color: var(--sk-fg-1);
			border-color: var(--sk-fg-3);
		}

		&:active {
			scale: 0.97;
		}

		&:focus-visible {
			outline: 2px solid var(--sk-fg-accent);
			outline-offset: 2px;
		}
	}

	.steps {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.step {
		position: relative;
		display: block;
		width: 2.4rem;
		/* taller than it looks, so it is easier to tap, without taking up more room */
		height: 4.4rem;
		margin-block: -1.2rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;

		&::before,
		&::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			top: calc(50% - 0.1rem);
			height: 0.2rem;
			border-radius: 0.1rem;
			/* dark enough to see against the page, at 3:1 or more */
			background: var(--sk-fg-4);
		}

		&::after {
			background: var(--sk-fg-1);
			transform-origin: left;
			scale: var(--progress) 1;
			/* between the few times a second the time it has played is known, so it fills evenly */
			transition: scale 0.25s linear;
		}

		/* emptied at once as the next one starts, rather than running backwards */
		&[aria-current='false']::after {
			transition: none;
		}

		/* the one in front wider, with a darker track, so it shows which it is before it fills. a
		   width rather than a scale, so the rest make room, which with so few is cheap */
		@media (prefers-reduced-motion: no-preference) {
			transition: width 0.3s var(--quint-out);
		}

		&[aria-current='true'] {
			width: 4.8rem;

			/* lighter than the rest, so the fill stands out against it as it grows */
			&::before {
				background: color-mix(in srgb, var(--sk-fg-4) 45%, var(--sk-bg-1));
			}
		}

		&:hover::before {
			background: var(--sk-fg-3);
		}

		&:focus-visible {
			outline: 2px solid var(--sk-fg-accent);
			outline-offset: -1rem;
		}

		/* at least 24px across everywhere, so it is easy enough to hit */
	}

	@keyframes name-in {
		from {
			opacity: 0;
			translate: 0 0.4rem;
		}
	}
</style>
