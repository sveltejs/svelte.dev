import { quintOut } from 'svelte/easing';
import type { Tween } from 'svelte/motion';
import { BY_HAND } from './ring.ts';

interface Drag {
	id: number;
	x: number;
	y: number;
	/** the ring's turn as it started */
	from: number;
	/** a card's width as it started */
	width: number;
	moved: boolean;
	/** the last few places it was, to tell how fast it was going as it was let go */
	samples: Array<{ t: number; at: number }>;
}

/**
 * turns the ring by hand: dragged by a pointer and flung on as it is let go, or by sideways
 * scrolling on a trackpad, landing on a card either way
 */
export class Swipe {
	/** a hand is holding it, which stops it turning on its own */
	dragging = $state(false);

	#turn: Tween<number>;
	#width: () => number;
	#slides: () => boolean;
	#ontouch: () => void;
	#drag: Drag | undefined;

	/** set after a drag, so the click that follows on letting go does not open the card */
	#dragged = false;
	#wheel_timer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * `width` gives a card's width, the distance that turns it by one, `slides` says whether it
	 * slides on to the card it lands on once let go rather than being there at once, and `ontouch`
	 * is called as soon as a hand turns it
	 */
	constructor(
		turn: Tween<number>,
		width: () => number,
		slides: () => boolean,
		ontouch: () => void
	) {
		this.#turn = turn;
		this.#width = width;
		this.#slides = slides;
		this.#ontouch = ontouch;
	}

	/** whether a click is the end of a drag, which should not open what it lands on */
	ends_drag() {
		const dragged = this.#dragged;
		this.#dragged = false;
		return dragged;
	}

	down = (event: PointerEvent) => {
		if (event.button !== 0) return;
		this.#drag = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			from: this.#turn.current,
			width: this.#width(),
			moved: false,
			samples: [{ t: event.timeStamp, at: this.#turn.current }]
		};
		this.#dragged = false;
	};

	move = (event: PointerEvent) => {
		const drag = this.#drag;
		if (!drag || event.pointerId !== drag.id) return;

		const dx = event.clientX - drag.x;
		const dy = event.clientY - drag.y;

		if (!drag.moved) {
			// up and down is the page scrolling, not the ring turning
			if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) {
				if (Math.abs(dy) > 10) this.#drag = undefined;
				return;
			}
			drag.moved = true;
			this.dragging = true;
			this.#ontouch();
			try {
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
			} catch {
				// the pointer has already gone
			}
		}

		// a card's width across turns it by a card, so the one in front stays under the finger
		const at = drag.from - dx / drag.width;
		this.#turn.set(at, { duration: 0 });

		drag.samples.push({ t: event.timeStamp, at });
		if (drag.samples.length > 5) drag.samples.shift();
	};

	up = (event: PointerEvent) => {
		const drag = this.#drag;
		if (!drag || event.pointerId !== drag.id) return;
		this.#drag = undefined;
		this.dragging = false;
		if (!drag.moved) return;

		this.#dragged = true;

		// thrown on by however fast it was going as it was let go, landing on a card
		const turn = this.#turn;
		const first = drag.samples[0];
		const last = drag.samples[drag.samples.length - 1];
		const elapsed = Math.max(last.t - first.t, 1);
		const velocity = (last.at - first.at) / elapsed; // cards per millisecond
		const fresh = event.timeStamp - last.t < 80;
		const thrown = fresh ? Math.max(-4, Math.min(4, velocity * 400)) : 0;

		let to = Math.round(turn.current + thrown);
		// at least on to the next in the direction of a quick flick
		if (to === Math.round(drag.from) && Math.abs(velocity) > 0.002) {
			to = velocity > 0 ? Math.ceil(turn.current) : Math.floor(turn.current);
		}

		// as long as it takes to start off as fast as it was thrown, since the curve starts five
		// times as fast as its average, so it carries on from the hand without a lurch or a stall
		const distance = Math.abs(to - turn.current);
		const speed = Math.abs(velocity);
		const duration = fresh && speed > 0.0005 ? (5 * distance) / speed : BY_HAND;

		turn.set(to, {
			duration: this.#slides() ? Math.max(300, Math.min(700, duration)) : 0,
			easing: quintOut
		});
	};

	/**
	 * sideways scrolling on a trackpad turns it with the fingers, as far as they and the momentum
	 * after them go, landing on the nearest card once it stops
	 */
	wheel = (event: WheelEvent) => {
		if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
		event.preventDefault();

		// in lines rather than pixels in some browsers with a mouse wheel
		const pixels = event.deltaMode === 1 ? event.deltaX * 16 : event.deltaX;

		this.#ontouch();
		this.dragging = true;
		this.#turn.set(this.#turn.current + pixels / this.#width(), { duration: 0 });

		clearTimeout(this.#wheel_timer);
		this.#wheel_timer = setTimeout(() => {
			this.dragging = false;
			this.#turn.set(Math.round(this.#turn.current), {
				duration: this.#slides() ? BY_HAND : 0,
				easing: quintOut
			});
		}, 120);
	};
}
