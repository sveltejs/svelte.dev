import { read } from '$app/server';
import { index } from '$lib/server/content';
import { transform } from './markdown.server';
import type { Exercise, ExerciseStub, PartStub, Scope } from '$lib/tutorial';
import { error } from '@sveltejs/kit';
import { text_files } from './shared';
import type { Document } from '@sveltejs/site-kit';

const lookup: Record<
	string,
	{
		part: Document;
		chapter: Document;
		exercise: Document;
		assets: {
			a: Record<string, string>;
			b: Record<string, string>;
		};
		prev: ExerciseStub | null;
		next: ExerciseStub | null;
	}
> = {};

let prev: null | { slug: string; title: string } = null;

let files: Record<string, string> = {};

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

					// if exercise has an `app-a` directory, reset `files`, otherwise
					// inherit the starting state from the previous exercise's end state
					for (const key in exercise.assets) {
						if (key.startsWith('app-a/')) {
							files = {};
							break;
						}
					}

					const a = { ...files };
					const b: Record<string, string> = {};

					for (const key in exercise.assets) {
						const asset = exercise.assets[key];

						if (key.startsWith('app-a/')) {
							a[key.slice(6)] = asset;
						} else if (key.startsWith('app-b/')) {
							b[key.slice(6)] = asset;
						}
					}

					files = { ...a, ...b };

					// while we're here, populate the lookup
					lookup[slug] = { part, chapter, exercise, assets: { a, b }, prev, next: null };
					if (prev) lookup[prev.slug].next = stub;

					prev = stub;
					return stub;
				})
			};
		})
	};
});

async function get(assets: Record<string, string>, key: string) {
	const response = read(assets[key]);
	const match = /\.[^.]+$/.exec(key);
	const ext = match ? match[0] : '';

	return text_files.has(ext)
		? await response.text()
		: Buffer.from(await response.arrayBuffer()).toString('base64');
}

export async function load_exercise(slug: string): Promise<Exercise> {
	if (!(slug in lookup)) {
		error(404, 'No such tutorial found');
	}

	const { part, chapter, exercise, assets, prev, next } = lookup[slug];

	const metadata = {
		...part.metadata,
		...chapter.metadata,
		...exercise.metadata
	};

	const scope = metadata.scope as Scope;
	const focus = metadata.focus as string;

	// TODO load part/chapter assets separately, not for each exercise?
	const common = {
		...index.tutorial.assets,
		...part.assets,
		...chapter.assets
	};

	const a: Record<string, string> = {};
	const b: Record<string, string> = {};

	for (const key in assets.a) {
		// https://github.com/vitejs/vite/issues/17484 — need to replace `.css.x` with `.css`
		a[key.replace(/\.css\.x$/, '.css')] = await get(assets.a, key);
	}

	for (const key in assets.b) {
		b[key.replace(/\.css\.x$/, '.css')] = await get(assets.b, key);
	}

	for (const key in common) {
		if (!(key in a)) {
			a[key] = await read(common[key]).text();
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
			create: new Set(exercise.metadata.editing_constraints?.create ?? []),
			remove: new Set(exercise.metadata.editing_constraints?.remove ?? [])
		},
		a,
		b,
		has_solution: Object.keys(b).length > 0
	};
}
