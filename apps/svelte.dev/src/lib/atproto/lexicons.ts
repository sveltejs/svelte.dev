import { defineLexicons, l } from 'airspace/lexicon';

// Source of truth for the NSIDs published on the @svelte.dev repo (see docs/playground.md)

const file = l.object({
	name: l.string({ maxLength: 300 }),
	contents: l.string({ maxLength: 500_000 })
});

export const lexicons = defineLexicons({
	'dev.svelte.playground': {
		main: l.record({
			key: 'tid',
			description:
				'A Svelte playground app: a small set of source files plus a few compiler options.',
			record: l.object({
				name: l.string({ maxLength: 300 }),
				files: l.array(l.ref(() => file)),
				tailwind: l.optional(l.boolean()),
				svelteVersion: l.optional(
					l.string({ maxLength: 64, description: 'Pinned Svelte version. Absent means latest.' })
				),
				createdAt: l.string({ format: 'datetime' }),
				updatedAt: l.string({ format: 'datetime' })
			})
		}),
		file
	},
	'dev.svelte.playground.private': l.space({
		key: 'literal:self',
		collections: ['dev.svelte.playground'],
		name: 'Private playground apps',
		description: 'Playground apps only their owner can open.'
	})
});

export const playground = lexicons['dev.svelte.playground'].main;
export const private_space = lexicons['dev.svelte.playground.private'];
