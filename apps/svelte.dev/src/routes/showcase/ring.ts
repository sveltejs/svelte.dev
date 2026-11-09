/** how long one without a clip stays in front before the carousel moves on, in milliseconds */
export const DWELL = 5000;

/**
 * how long a turn of one card takes: unhurried when it moves on by itself, and quicker when
 * turned by hand, so it keeps up with the hand. both on the same strong ease-out
 */
export const ON_ITS_OWN = 700;
export const BY_HAND = 450;

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

/** where a card stands, given how far it is from the front, in cards, to the right if more than 0 */
export function place(o: number) {
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

/** which of `count` cards a turn of the ring is, which can be any whole number */
export function wrap(i: number, count: number) {
	return ((i % count) + count) % count;
}

/**
 * how far a card is from the front, in cards, to the right if more than 0 and the left if less,
 * whichever way round is shorter
 */
export function offset(i: number, at: number, count: number) {
	const ahead = (((i - at) % count) + count) % count;
	return ahead > count / 2 ? ahead - count : ahead;
}
