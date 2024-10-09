import type { Exercise } from '$lib/tutorial';

export const text_files = new Set([
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

/** The SvelteKit tutorial needs web container technology */
export function needs_webcontainers(exercise: Exercise | undefined) {
	return !!exercise && /sveltekit$/.test(exercise.part?.slug);
}
