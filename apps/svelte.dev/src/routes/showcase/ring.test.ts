import { describe, expect, it } from 'vitest';
import { offset, place, wrap } from './ring.ts';

describe('wrap', () => {
	it('wraps a turn either way round to a card', () => {
		expect(wrap(3, 10)).toBe(3);
		expect(wrap(10, 10)).toBe(0);
		expect(wrap(-1, 10)).toBe(9);
		expect(wrap(-21, 10)).toBe(9);
	});
});

describe('offset', () => {
	it('is how far a card is from the front, the shorter way round', () => {
		expect(offset(0, 0, 10)).toBe(0);
		expect(offset(2, 0, 10)).toBe(2);
		expect(offset(9, 0, 10)).toBe(-1);
		expect(offset(0, 9, 10)).toBe(1);
		expect(offset(3, 23, 10)).toBe(0);
	});

	it('follows the ring between cards', () => {
		expect(offset(1, 0.5, 10)).toBe(0.5);
		expect(offset(0, 0.5, 10)).toBe(-0.5);
	});
});

describe('place', () => {
	it('puts the card in front in the middle, facing the viewer', () => {
		expect(place(0)).toEqual({ x: 50, z: 0, r: 0 });
	});

	it('mirrors the left on the right', () => {
		const right = place(1.5);
		const left = place(-1.5);
		expect(left.x).toBeCloseTo(100 - right.x);
		expect(left.z).toBeCloseTo(right.z);
		expect(left.r).toBeCloseTo(-right.r);
	});

	it('keeps those further round out of sight in the last place', () => {
		expect(place(7)).toEqual(place(3));
	});
});
