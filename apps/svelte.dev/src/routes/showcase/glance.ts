import type { Player } from './player.svelte.ts';
import { clips, cropped, full } from './media.ts';

/** how far each fling goes, relative to the others, so it reads as a hand on the trackpad */
const FLINGS = [1, 1.3, 0.8, 1.15, 0.9, 1.25, 0.7, 1.05];

/**
 * swaps in the whole screenshot once a mouse rests on the link to a site, and marks it once it
 * loads so the page can scroll down it, or plays its clip if it has one, in the given frame.
 * touch screens never hover, so they only ever load the tops, and a pointer passing over loads
 * nothing
 */
export function lengthen(event: PointerEvent, host: HTMLElement, id: string, player: Player) {
	const target = event.currentTarget as HTMLElement;
	const img = host.querySelector('img');

	if (
		!img ||
		event.pointerType !== 'mouse' ||
		!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
			.matches
	) {
		return;
	}

	// one with a clip plays it instead, until the pointer leaves
	if (clips[id]) {
		const timer = setTimeout(() => player.play(host, id), 100);
		target.addEventListener(
			'pointerleave',
			() => {
				clearTimeout(timer);
				player.release(host);
			},
			{ once: true }
		);
		return;
	}

	// one shown from somewhere other than the top stays where it is
	// nor one no taller than the window, with nothing further down to show
	const whole = full[id].img;
	const slide = img.parentElement;
	if (!slide || full[id] === cropped[id] || whole.h / whole.w < 0.7) return;

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
	const weights = Array.from({ length: count }, (_, i) => FLINGS[i % FLINGS.length]);
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

function swap(img: HTMLImageElement, id: string, loaded: () => void) {
	if (img.dataset.long !== undefined) return;

	const picture = full[id];
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
