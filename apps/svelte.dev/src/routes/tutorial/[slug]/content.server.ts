import { read } from '$app/server';
import { index } from '$lib/server/content';
import { transform } from '$lib/server/tutorial/markdown';
import type { Exercise, ExerciseStub, PartStub, Scope } from '$lib/tutorial';
import type { Document } from '@sveltejs/site-kit';

const text_files = new Set([
	'.svelte',
	'.txt',
	'.json',
	'.js',
	'.ts',
	'.css',
	'.svg',
	'.html',
	'.md',
	'.env'
]);

const lookup: Record<
	string,
	{
		part: Document;
		chapter: Document;
		exercise: Document;
		prev: ExerciseStub | null;
		next: ExerciseStub | null;
	}
> = {};

let prev: null | { slug: string; title: string } = null;

export const parts: PartStub[] = index.tutorial.children.map((part) => {
	return {
		slug: part.slug,
		title: part.metadata.title,
		chapters: part.children.map((chapter) => {
			return {
				slug: chapter.slug.split('/').pop()!,
				title: chapter.metadata.title,
				exercises: chapter.children.map((exercise) => {
					const slug = exercise.slug.split('/').pop()!;

					const stub: ExerciseStub = {
						slug,
						title: exercise.metadata.title
					};

					// while we're here, populate the lookup
					lookup[slug] = { part, chapter, exercise, prev, next: null };
					if (prev) lookup[prev.slug].next = stub;

					prev = stub;
					return stub;
				})
			};
		})
	};
});

export async function load_exercise(slug: string): Promise<Exercise> {
	const { part, chapter, exercise, prev, next } = lookup[slug];

	const metadata = {
		...part.metadata,
		...chapter.metadata,
		...exercise.metadata
	};

	const scope = metadata.scope as Scope;
	const focus = metadata.focus as string;

	// TODO load these separately, not for each exercise
	const common = {
		...part.assets,
		...chapter.assets
	};

	const a: Record<string, string> = {};
	const b: Record<string, string> = {};

	for (const key in exercise.assets) {
		const response = read(exercise.assets[key]);
		const match = /\.[^.]+$/.exec(key);
		const ext = match ? match[0] : '';
		const is_text = text_files.has(ext);

		const data = is_text ? await response.text() : 'TODO base64-encode binary files';

		if (key.startsWith('app-a/')) {
			a[key.slice(6)] = data;
		} else {
			b[key.slice(6)] = data;
		}
	}

	const filenames = new Set();

	return {
		part: {
			slug: part.slug,
			title: part.metadata.title,
			label: 'TODO' // 'Part 1' etc
		},
		chapter: {
			slug: chapter.slug,
			title: chapter.metadata.title
		},
		scope,
		focus,
		title: exercise.metadata.title,
		path: (metadata.path as string) ?? '/',
		slug: exercise.slug,
		prev: prev && { slug: prev.slug },
		next,
		markdown: exercise.body,
		html: await transform(exercise.body, {
			codespan: (text) =>
				filenames.size > 1 && filenames.has(text)
					? `<code data-file="${scope.prefix + text}">${text}</code>`
					: `<code>${text}</code>`
		}),
		dir: exercise.file.split('/').slice(0, -1).join('/'),
		editing_constraints: {
			create: new Set(['TODO']),
			remove: new Set(['TODO'])
		},
		a: {},
		b: {},
		has_solution: false
	};
}
