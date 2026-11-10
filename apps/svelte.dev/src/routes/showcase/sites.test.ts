import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories, hero, members, more, sites } from './sites.ts';

const screenshots = new Set(
	fs
		.readdirSync(path.join(import.meta.dirname, 'screenshots'))
		.map((file) => file.replace(/(@2x)?\.\w+$/, ''))
);

describe('sites', () => {
	it('have ids of their own', () => {
		const ids = sites.map((site) => site.id);
		expect(ids).toEqual([...new Set(ids)]);
	});

	it('each have a screenshot, and no screenshot is left without a site', () => {
		expect([...screenshots].toSorted()).toEqual(sites.map((site) => site.id).toSorted());
	});

	it('fill every category', () => {
		for (const category of categories) {
			expect(members(category.id), category.id).not.toHaveLength(0);
		}
	});

	it('are each in the hero or the many more once at most', () => {
		expect(hero).toEqual([...new Set(hero)]);
		expect(more).toEqual([...new Set(more)]);
	});
});
