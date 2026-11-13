import { createContext } from 'svelte';
import { prefersReducedMotion } from 'svelte/motion';
import { clips } from './media.ts';
import { on_screen } from './on-screen.ts';

/** whether clips may play on their own, unless motion is reduced or the visitor saves data */
function may_move() {
	const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
	return !prefersReducedMotion.current && !connection?.saveData;
}

/** where being paused is remembered from one visit to the next */
export const paused_key = 'showcase:paused';

/** on the page while it is paused, which the pause button shows itself by */
export const paused_class = 'showcase-paused';

/**
 * plays the clips over the screenshots of the list: each that is mostly in the window, and any
 * pointed at or focused, unless the button at the start of the page has paused them
 */
export class Player {
	/** whether anything moves on its own, which the button at the start of the page turns off */
	autoplay = $state(true);

	/** the screenshots with clips that are mostly in the window */
	#visible = new Map<HTMLElement, string>();
	#waiting = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

	/** remembers being paused from the last visit */
	restore() {
		try {
			if (localStorage.getItem(paused_key)) this.autoplay = false;
		} catch {}

		// already there on a page loaded paused, but not on one arrived at from elsewhere on the site
		document.documentElement.classList.toggle(paused_class, !this.autoplay);
	}

	toggle() {
		this.autoplay = !this.autoplay;
		document.documentElement.classList.toggle(paused_class, !this.autoplay);

		// remembered, so it stays paused on the next visit
		try {
			if (this.autoplay) localStorage.removeItem(paused_key);
			else localStorage.setItem(paused_key, '1');
		} catch {}

		if (!this.autoplay) {
			for (const host of document.querySelectorAll<HTMLElement>('[data-playing]')) this.stop(host);
		} else if (!prefersReducedMotion.current) {
			for (const [host, id] of this.#visible) this.play(host, id);
		}
	}

	/**
	 * plays the clip of a screenshot while it is mostly in the window, and stops it once it is mostly
	 * out. a moment late, so scrolling past loads nothing
	 */
	in_view(id: string) {
		return on_screen(
			(entry) => {
				const host = entry.target as HTMLElement;

				// most of it, or most of the window where it is taller than that
				const shown = entry.intersectionRect.height;
				const whole = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? 0);
				const inside = entry.isIntersecting && shown >= whole * 0.6;

				clearTimeout(this.#waiting.get(host));

				if (inside) {
					this.#visible.set(host, id);
					if (may_move() && this.autoplay) {
						this.#waiting.set(
							host,
							setTimeout(() => this.play(host, id), 300)
						);
					}
				} else {
					this.#visible.delete(host);
					this.release(host);
				}
			},
			{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
		);
	}

	/** plays the clip over a screenshot, loading it the first time */
	play(host: HTMLElement, id: string) {
		const video = host.querySelector<HTMLVideoElement>('.clip');
		if (!video || !clips[id] || !this.autoplay) return;

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

	/** plays the clip of a site as the keyboard reaches it */
	focus(host: HTMLElement, id: string) {
		if (!prefersReducedMotion.current) this.play(host, id);
	}

	/** stops a clip once pointed away from or left, unless it is still in the window */
	release(host: HTMLElement) {
		if (!this.#visible.has(host) && !host.matches(':hover') && !host.closest(':focus')) {
			this.stop(host);
		}
	}

	stop(host: HTMLElement) {
		const video = host.querySelector<HTMLVideoElement>('.clip');
		if (!video) return;

		delete host.dataset.playing;
		video.pause();

		// from the start next time, once it has faded out
		setTimeout(() => {
			if (host.dataset.playing === undefined) video.currentTime = 0;
		}, 300);
	}
}

/** the one player of the page, for whatever in it plays or pauses clips */
export const [get_player, set_player] = createContext<Player>();
