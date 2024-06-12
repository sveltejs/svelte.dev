import { index } from '$lib/server/content';
import type { Exercise, PartStub } from '$lib/tutorial';
import type { Page } from '@sveltejs/site-kit';

const lookup: Record<string, { part: Page; chapter: Page; exercise: Page }> = {};

export const parts: PartStub[] = index.tutorial.children.map((part) => {
	return {
		slug: part.slug,
		title: part.title,
		chapters: part.children.map((chapter) => {
			return {
				slug: chapter.slug.split('/').pop()!,
				title: chapter.title,
				exercises: chapter.children.map((exercise) => {
					const slug = exercise.slug.split('/').pop()!;

					// while we're here, populate the lookup
					lookup[slug] = { part, chapter, exercise };

					return {
						slug,
						title: exercise.title
					};
				})
			};
		})
	};
});

export async function load_exercise(slug: string): Promise<Exercise> {
	const { part, chapter, exercise } = lookup[slug];

	return {
		part,
		chapter,
		exercise
	};
}
