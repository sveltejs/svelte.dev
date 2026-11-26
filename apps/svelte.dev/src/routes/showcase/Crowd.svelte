<!--@component
the many more, smaller and in rows across the whole width of the window, cut off at either side
like the logos on the home page. each row drifts slowly and without end, every other one the other
way, and can be swiped along or back as it does. where motion is paused or reduced the rows stay
where they are until moved by hand. tab stops once at each row, and the arrow keys go along it and
from row to row, the row coming round to whatever they reach
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { on_screen } from './on-screen.ts';
	import { get_player } from './player.svelte.ts';
	import type { Site } from './sites.ts';
	import Tile from './Tile.svelte';

	interface Props {
		sites: Site[];
	}

	let { sites }: Props = $props();

	const player = get_player();

	/** how long each one takes to pass, in milliseconds, slow enough to read their names */
	const PACE = 16_000;

	/** a little quicker or slower from one row to the next, so the rows never keep in step */
	const PACES = [1, 1.1, 0.92, 1.06, 0.96];

	/** at least seven to a row, more than a window holds, so a row never runs out as it drifts */
	const rows = $derived.by(() => {
		const count = Math.max(1, Math.floor(sites.length / 7));

		return Array.from({ length: count }, (_, i) =>
			sites.slice(
				Math.round((i * sites.length) / count),
				Math.round(((i + 1) * sites.length) / count)
			)
		);
	});

	const moving = $derived(player.autoplay && !prefersReducedMotion.current);

	/** in the window, outside of which nothing drifts */
	let seen = $state(false);

	/** the row the mouse is over, which waits so what is in it can be clicked */
	let pointed = $state(-1);

	/** the row the keyboard is in, which stops and comes round to what has focus */
	let focused = $state(-1);

	/** which one in each row tab stops at, the first until the arrow keys have been along it */
	const stops = $state<Record<number, number>>({});

	const uid = $props.id();

	/** the links of a row, without those of its copies */
	function links(row: HTMLElement) {
		return [...row.querySelectorAll<HTMLElement>('ul:not([aria-hidden]) a')];
	}

	/** how much of a row at either end fades out, where what has focus is not left */
	const FADE = 0.15;

	/** the row that what says how the keyboard gets about is over, or was last */
	let hinted = $state(0);

	/** a key held down, which the rows keep up with rather than ease after */
	let held = false;

	/** the row with the site the address names, kept where that site can be seen */
	let linked = $state(-1);

	/** what each row does as the address comes to name another site */
	const arrivals = new Set<() => void>();

	/** what brings each row round to one of its links */
	const reveals = new WeakMap<HTMLElement, (link: HTMLElement) => void>();

	/** tab stops where the keyboard last was in the row, however it got there */
	function enter(event: FocusEvent & { currentTarget: HTMLElement }, index: number) {
		const row = event.currentTarget;
		const target = event.target as HTMLElement;
		const at = links(row).indexOf(target);

		if (at !== -1) stops[index] = at;
		if (linked === index) linked = -1;
		if (!target.matches(':focus-visible')) return;

		focused = hinted = index;
		reveals.get(row)?.(target);
	}

	/**
	 * the arrow keys go along the row, round from its last to its first as the row itself does, and
	 * up and down to whichever is nearest above or below in the next row, and home and end to
	 * either end of the row, so that tab can leave for the next row from anywhere in it
	 */
	function keys(event: KeyboardEvent & { currentTarget: HTMLElement }) {
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

		const row = event.currentTarget;
		const all = links(row);
		const at = all.indexOf(event.target as HTMLElement);
		if (at === -1) return;

		let to: HTMLElement | undefined;

		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const next = event.key === 'ArrowUp' ? row.previousElementSibling : row.nextElementSibling;
			if (!(next instanceof HTMLElement) || !next.classList.contains('row')) return;

			// the nearest across, of all that are in the row, and what it is a copy of if it is one,
			// which the row then puts where its copy was
			const rect = all[at].getBoundingClientRect();
			const middle = rect.left + rect.width / 2;
			let nearest = Infinity;

			for (const list of next.querySelectorAll('ul')) {
				[...list.querySelectorAll('a')].forEach((link, i) => {
					const { left, width } = link.getBoundingClientRect();
					const away = Math.abs(left + width / 2 - middle);
					if (away >= nearest) return;

					nearest = away;
					to = links(next)[i];
				});
			}
		} else {
			to =
				all[
					{
						ArrowRight: (at + 1) % all.length,
						ArrowLeft: (at - 1 + all.length) % all.length,
						Home: 0,
						End: all.length - 1
					}[event.key] ?? -1
				];
		}

		if (!to) return;
		event.preventDefault();

		// the row comes round to it itself, and the page moves only as far as shows the row
		held = event.repeat;
		to.focus({ preventScroll: true });
		held = false;

		to.closest('.row')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	/**
	 * drifts a row for as long as it may, and lets it be moved along by hand or by the keyboard
	 * whether it drifts or not. the row is its list three times over, the one in the middle the real
	 * one, moved round and round by the length of one, so it has no end either way
	 */
	function drift(index: number) {
		return (row: HTMLElement) => {
			const track = row.firstElementChild as HTMLElement;
			const [before, list] = track.children as unknown as HTMLElement[];
			const reverse = index % 2 === 1;
			const duration = rows[index].length * PACE * PACES[index % PACES.length];

			/** how far it goes before a copy is where the list was, and it starts again unseen */
			const lap = () => list.offsetLeft - before.offsetLeft;

			const animation = track.animate(
				[{ translate: '0' }, { translate: 'calc((-100% - var(--gap)) / 3)' }],
				{ duration, iterations: Infinity, direction: reverse ? 'reverse' : 'normal' }
			);

			// many laps in, so a hand can take it back as far as it likes without it running out
			animation.currentTime = 1000 * duration;
			animation.pause();

			/**
			 * how many laps along the whole of it is set, on top of the lap it goes round: one, or
			 * none. which of the two makes no difference to how it looks, only to where the real list
			 * is, so between them the real one of any can be put anywhere in the window
			 */
			let laps = -1;
			track.style.setProperty('--laps', '-1');

			row.classList.add('drifting');
			row.scrollLeft = 0;

			/** free to drift, with nothing holding it where it is */
			const free = () =>
				moving && seen && pointed !== index && focused !== index && linked !== index;

			$effect(() => {
				if (free()) animation.play();
				else animation.pause();
			});

			/**
			 * where the first of its three lists starts, from where it would with nothing moved. as
			 * it is on the page, rather than worked out from how far round it is, which is not to be
			 * told apart at the very start and end of a lap
			 */
			const where = () =>
				before.getBoundingClientRect().left -
				row.getBoundingClientRect().left -
				parseFloat(getComputedStyle(track).marginLeft);

			/** puts the first of its lists there, by the lap it is set along and how far round it is */
			function put(to: number) {
				const length = lap();

				// only so far either way keeps the window full
				while (to > 0) to -= length;
				while (to <= -2 * length) to += length;

				// only as it changes, since writing it has the whole row's style worked out again
				const set = to > -length ? 0 : -1;
				if (set !== laps) track.style.setProperty('--laps', String((laps = set)));

				// short of either end of the lap, where one end is not to be told from the other
				const part = (laps * length - to) / length;
				const along = Math.max(1e-7, Math.min(reverse ? 1 - part : part, 1 - 1e-7));
				animation.currentTime = (1000 + along) * duration;
			}

			let gliding = 0;
			let settling = 0;

			/**
			 * takes it from where it is to where it should be, quickly and easing to a stop, a little
			 * longer the further it has to go, so the eye can follow where the row went. at once where
			 * motion is reduced
			 */
			function glide(from: number, to: number) {
				cancelAnimationFrame(gliding);
				gliding = 0;

				const distance = Math.abs(to - from);
				if (distance < 1) return;

				if (prefersReducedMotion.current) {
					put(to);
					return;
				}

				const length = Math.min(240, 140 + distance / 10);
				const start = performance.now();

				const step = (now: number) => {
					const t = Math.min(1, (now - start) / length);
					put(from + (to - from) * (1 - (1 - t) ** 4));
					gliding = t < 1 ? requestAnimationFrame(step) : 0;
				};

				gliding = requestAnimationFrame(step);
			}

			/**
			 * brings one of its links clear of where the row fades out at either end, moving the row
			 * no further than that takes, and not at all if it already is. where its copy is nearer
			 * than it is, the row is first set a lap along so that it is where its copy was, which
			 * shows no differently
			 */
			reveals.set(row, (link) => {
				// straight there for a key held down, or one pressed again before the row has got
				// to where the last sent it, which easing would only leave it trailing behind
				const hurried = held || gliding !== 0;

				cancelAnimationFrame(settling);
				cancelAnimationFrame(gliding);
				gliding = 0;
				animation.playbackRate = 1;
				animation.pause();

				const bounds = row.getBoundingClientRect();
				const rect = link.getBoundingClientRect();
				const left = bounds.left + bounds.width * FADE;
				const right = bounds.right - bounds.width * FADE;
				const length = lap();
				const from = where();

				let best = { to: from, by: Infinity };

				for (const n of [0, -1, 1]) {
					const to = from + n * length;
					if (to > 0 || to <= -2 * length) continue;

					const x = rect.left + n * length;
					const by = x < left ? left - x : x + rect.width > right ? right - x - rect.width : 0;

					if (Math.abs(by) < Math.abs(best.by)) best = { to, by };
				}

				if (best.by === Infinity) return;

				if (hurried) put(best.to + best.by);
				else {
					put(best.to);
					glide(best.to, best.to + best.by);
				}
			});

			/** how long it takes to drift a pixel to the left, less than none where it drifts right */
			const pace = () => ((reverse ? -1 : 1) * duration) / lap();

			let drag:
				| { id: number; x: number; from: number; samples: Array<{ t: number; x: number }> }
				| undefined;
			let start: { id: number; x: number; y: number } | undefined;
			let dragged = false;
			/** the pointer that stopped it while it was still flying from a swipe */
			let caught: number | undefined;

			/** eases from however fast it was let go, either way, back to its own drift */
			function settle(rate: number) {
				let then = performance.now();

				const step = (now: number) => {
					rate = 1 + (rate - 1) * Math.exp((then - now) / 500);
					then = now;
					if (Math.abs(rate - 1) < 0.05) rate = 1;

					animation.playbackRate = rate;
					if (rate !== 1) settling = requestAnimationFrame(step);
				};

				animation.playbackRate = rate;
				if (free()) animation.play();
				settling = requestAnimationFrame(step);
			}

			// by a finger or a pen. a mouse stops the row by pointing at it, to click what is in it
			function down(event: PointerEvent) {
				// whatever is pressed next is not the end of the last drag
				dragged = false;

				if (event.pointerType === 'mouse' || !event.isPrimary) return;
				start = { id: event.pointerId, x: event.clientX, y: event.clientY };
				if (linked === index) linked = -1;

				// a finger put down on one still flying from a swipe stops it there
				if (Math.abs(animation.playbackRate) > 3) {
					caught = event.pointerId;
					cancelAnimationFrame(settling);
					animation.pause();
				}
			}

			function move(event: PointerEvent) {
				if (start && event.pointerId === start.id) {
					const dx = event.clientX - start.x;
					const dy = event.clientY - start.y;

					// up and down is the page scrolling, not the row
					if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) {
						if (Math.abs(dy) > 10) start = undefined;
						return;
					}

					// held from where it has drifted to by now, so it does not jump
					start = undefined;
					caught = undefined;
					cancelAnimationFrame(settling);
					cancelAnimationFrame(gliding);
					gliding = 0;
					animation.pause();
					drag = {
						id: event.pointerId,
						x: event.clientX,
						from: Number(animation.currentTime),
						samples: []
					};
					try {
						row.setPointerCapture(event.pointerId);
					} catch {
						// the pointer has already gone
					}
				}

				if (!drag || event.pointerId !== drag.id) return;

				// under the finger, wherever it goes
				animation.currentTime = drag.from - (event.clientX - drag.x) * pace();

				drag.samples.push({ t: event.timeStamp, x: event.clientX });
				if (drag.samples.length > 5) drag.samples.shift();
			}

			function up(event: PointerEvent) {
				if (start?.id === event.pointerId) start = undefined;

				// stopped and let go without being moved, which drifts on from there, and is not a tap
				// on whatever happened to be passing
				if (caught === event.pointerId) {
					caught = undefined;
					dragged = true;
					settle(0);
					return;
				}

				if (!drag || event.pointerId !== drag.id) return;

				const first = drag.samples[0];
				const last = drag.samples[drag.samples.length - 1];
				drag = undefined;
				dragged = true;

				// left where it was put where nothing moves of itself
				if (!moving) return;

				// thrown on by however fast it was going as it was let go, in pixels a millisecond,
				// or left where it is if the finger had stopped first. no faster than can be followed
				const fresh = last && event.timeStamp - last.t < 80;
				const velocity = fresh ? (last.x - first.x) / Math.max(last.t - first.t, 1) : 0;

				settle(-Math.max(-3, Math.min(3, velocity)) * pace());
			}

			// the click that follows a drag on letting go, which should not open what it lands on
			function click(event: MouseEvent) {
				if (!dragged) return;
				dragged = false;

				// one from the keyboard is no part of a drag, if none followed the last
				if (event.detail === 0) return;
				event.preventDefault();
				event.stopPropagation();
			}

			// sideways scrolling on a trackpad moves it with the fingers, as does a mouse wheel with
			// shift held, which some browsers still report as up and down
			function wheel(event: WheelEvent) {
				let { deltaX: x, deltaY: y } = event;
				if (event.shiftKey && !x) [x, y] = [y, 0];

				if (Math.abs(x) <= Math.abs(y)) return;
				event.preventDefault();
				cancelAnimationFrame(gliding);
				gliding = 0;

				// in lines rather than pixels in some browsers with a mouse wheel
				const pixels = event.deltaMode === 1 ? x * 16 : x;
				animation.currentTime = Number(animation.currentTime) + pixels * pace();
			}

			const listeners = new AbortController();
			const { signal } = listeners;
			row.addEventListener('pointerdown', down, { signal });
			row.addEventListener('pointermove', move, { signal });
			row.addEventListener('pointerup', up, { signal });
			row.addEventListener('pointercancel', up, { signal });
			row.addEventListener('click', click, { signal, capture: true });
			row.addEventListener('wheel', wheel, { signal, passive: false });

			// a link to one of its sites brings the row round to it at once, and keeps it there
			// until it is pointed at or the address names another
			function arrive() {
				const item = document.getElementById(location.hash.slice(1));
				const link = item && list.contains(item) ? item.querySelector('a') : null;

				if (!link) {
					if (linked === index) linked = -1;
					return;
				}

				linked = index;
				held = true;
				reveals.get(row)?.(link);
				held = false;
			}

			untrack(arrive);
			arrivals.add(arrive);

			return () => {
				listeners.abort();
				arrivals.delete(arrive);
				reveals.delete(row);
				cancelAnimationFrame(settling);
				cancelAnimationFrame(gliding);
				animation.cancel();
				track.style.removeProperty('--laps');
				row.classList.remove('drifting');
			};
		};
	}
</script>

<svelte:window onhashchange={() => arrivals.forEach((arrive) => arrive())} />

<div
	class="crowd"
	{@attach on_screen((entry) => (seen = entry.isIntersecting), { rootMargin: '10%' })}
>
	{#each rows as row, index (row[0].id)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="row"
			style:grid-row={index + 1}
			onpointerenter={(event) => {
				if (event.pointerType !== 'mouse') return;
				pointed = index;
				if (linked === index) linked = -1;
			}}
			onpointerleave={() => pointed === index && (pointed = -1)}
			onfocusin={(event) => enter(event, index)}
			onkeydown={keys}
			onfocusout={(event) =>
				!event.currentTarget.contains(event.relatedTarget as Node | null) &&
				focused === index &&
				(focused = -1)}
			{@attach drift(index)}
		>
			<div class="track">
				<!-- the same before and after, so the row has no end either way. for the eye and the
				     pointer only -->
				{@render copy(row)}

				<ul>
					{#each row as site, i (site.id)}
						<li id={site.id}>{@render tile(site, false, i !== (stops[index] ?? 0))}</li>
					{/each}
				</ul>

				{@render copy(row)}
			</div>
		</div>
	{/each}

	<!-- how to get about the rows, over the top edge of whichever one the keyboard is in -->
	<p id="{uid}-keys" class={['keys', { shown: focused !== -1 }]} style:grid-row={hinted + 1}>
		<kbd aria-hidden="true">←</kbd>
		<kbd aria-hidden="true">↑</kbd>
		<kbd aria-hidden="true">↓</kbd>
		<kbd aria-hidden="true">→</kbd>
		<span class="visually-hidden">Arrow keys</span>
		to move around
	</p>
</div>

{#snippet copy(row: Site[])}
	<ul aria-hidden="true">
		{#each row as site (site.id)}
			<li>{@render tile(site, true)}</li>
		{/each}
	</ul>
{/snippet}

{#snippet tile(site: Site, copy = false, passed = false)}
	<Tile
		{site}
		sizes="(min-width: 64em) 18vw, (min-width: 40em) 28vw, 39vw"
		compact
		still
		{copy}
		{passed}
		describedby={copy || passed ? undefined : `${uid}-keys`}
	/>
{/snippet}

<style>
	/* as many across as fit in the window with part of one cut off at either side, faded out
	   towards the edges, all the same size */
	.crowd {
		--across: 3;
		--gap: 1.2rem;
		/* half of one more across than the window holds */
		--width: calc(100vw / (var(--across) - 0.5) - var(--gap));

		display: grid;
		/* as wide as the window and no wider, however long the rows are */
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
		margin-inline: calc(50% - 50vw);

		@media (min-width: 40em) {
			--across: 4;
			--gap: 1.6rem;
		}

		@media (min-width: 64em) {
			--across: 6;
		}
	}

	/* not handed down to everything in the row, which would otherwise have its style worked out
	   again as it changes */
	@property --laps {
		syntax: '<number>';
		inherits: false;
		initial-value: -1;
	}

	/* scrolled by hand until it can be moved round, with no bar to show for it, like the edges of
	   the window it runs off */
	.row {
		grid-column: 1;
		/* room above and below, out into the gaps between the rows, for the ring round the one with
		   focus, which is otherwise cut off where the row ends */
		margin-block: -0.7rem;
		padding-block: 0.7rem;
		overflow-x: auto;
		/* each row rather than all of them together, which would cut off what says how the keyboard
		   gets along a row where it sits over the top of the first */
		mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);
		overscroll-behavior-x: contain;
		scrollbar-width: none;

		/* moved round by hand or of itself rather than scrolled, so only up and down is left to the
		   page */
		&:global(.drifting) {
			overflow-x: clip;
			touch-action: pan-y pinch-zoom;
		}

		/* set a lap along, or none, on top of how far round it has gone */
		&:global(.drifting) .track {
			transform: translateX(calc(var(--laps, -1) * (100% + var(--gap)) / 3));
		}

		/* every other one half of one along, so they do not line up in columns */
		&:nth-child(even) .track {
			margin-left: calc((var(--width) + var(--gap)) / -2);
		}
	}

	/* across the top edge of the row it is about, in the gap above it, so it covers next to
	   nothing of the one with focus, nor its name at the foot of it */
	.keys {
		grid-column: 1;
		z-index: 2;
		place-self: start center;
		translate: 0 -50%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
		padding: 0.5rem 1.2rem;
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-1);
		background: var(--sk-bg-2);
		border: 1px solid var(--sk-border);
		border-radius: 10rem;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s ease;

		/* there at once, as the keyboard gets to a row, and faded only as it leaves them */
		&.shown {
			opacity: 1;
			transition: none;
		}

		kbd {
			padding: 0 0.6rem;
			font-size: 1em;
			line-height: 1.5;
		}
	}

	.track,
	ul {
		display: flex;
		gap: var(--gap);
		width: max-content;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* sized by the list item rather than the screenshot, which Safari otherwise redraws with a
	   flicker while scrolling */
	li {
		flex: none;
		width: var(--width);
		container-type: inline-size;
		scroll-margin-top: var(--anchor-offset);
	}
</style>
