import { describe, expect, test } from 'vitest';
import { select_contributors } from './contributors.js';

const contributor = (login, contributions = 1) => ({ login, contributions });

describe('select_contributors', () => {
	test('round-robins repository rankings', () => {
		expect(
			select_contributors(
				[
					[contributor('svelte-1'), contributor('svelte-2')],
					[contributor('kit-1'), contributor('kit-2')],
					[contributor('cli-1'), contributor('cli-2')]
				],
				6
			).map(({ login }) => login)
		).toEqual(['svelte-1', 'kit-1', 'cli-1', 'svelte-2', 'kit-2', 'cli-2']);
	});

	test('skips bots and contributors already selected from another repository', () => {
		expect(
			select_contributors(
				[
					[contributor('shared'), contributor('svelte-2')],
					[contributor('shared'), contributor('dependabot[bot]'), contributor('kit-2')]
				],
				4
			).map(({ login }) => login)
		).toEqual(['shared', 'kit-2', 'svelte-2']);
	});

	test('continues selecting after a repository is exhausted', () => {
		expect(
			select_contributors(
				[[contributor('svelte-1')], [contributor('kit-1'), contributor('kit-2')]],
				3
			).map(({ login }) => login)
		).toEqual(['svelte-1', 'kit-1', 'kit-2']);
	});

	test('caps the selected contributor count', () => {
		const lists = Array.from({ length: 6 }, (_, repository) =>
			Array.from({ length: 10 }, (_, rank) => contributor(`${repository}-${rank}`))
		);

		expect(select_contributors(lists, 48)).toHaveLength(48);
	});
});
