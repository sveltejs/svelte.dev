import { describe, expect, it } from 'vitest';
import { allows } from './robots.ts';

describe('allows', () => {
	it('allows everything where there are no rules', () => {
		expect(allows('', '/')).toBe(true);
		expect(allows('User-agent: *\nDisallow:', '/checkout/cart')).toBe(true);
	});

	it('follows the rules for every visitor, in however many groups', () => {
		const robots = `
			User-Agent: *
			Disallow: /search

			User-Agent: *
			Disallow: /*/checkout/
			Disallow: /checkout/ # the till
		`;

		expect(allows(robots, '/')).toBe(true);
		expect(allows(robots, '/checkout/cart')).toBe(false);
		expect(allows(robots, '/fr/checkout/cart')).toBe(false);
		expect(allows(robots, '/search?q=tent')).toBe(false);
	});

	it('leaves aside rules for other visitors', () => {
		const robots = 'User-agent: SomeBot\nDisallow: /\n\nUser-agent: *\nDisallow: /private';

		expect(allows(robots, '/')).toBe(true);
		expect(allows(robots, '/private/page')).toBe(false);
	});

	it('goes by the longest rule that matches, allowing where two are as long', () => {
		const robots = 'User-agent: *\nDisallow: /\nAllow: /graphics/\nDisallow: /a\nAllow: /a';

		expect(allows(robots, '/graphics/2024')).toBe(true);
		expect(allows(robots, '/news')).toBe(false);
		expect(allows(robots, '/a')).toBe(true);
	});

	it('takes $ as the end of the path', () => {
		const robots = 'User-agent: *\nDisallow: /*.pdf$';

		expect(allows(robots, '/report.pdf')).toBe(false);
		expect(allows(robots, '/report.pdf?page=2')).toBe(true);
	});
});
