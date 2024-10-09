import { redirect } from '@sveltejs/kit';
import { load_exercise, parts } from './content.server';

export const prerender = true;

const redirects = new Map([
	['reactive-assignments', 'svelte/state'],
	['reactive-declarations', 'svelte/derived-state'],
	['reactive-statements', 'svelte/effects'],
	['updating-arrays-and-objects', 'svelte/deep-state'],
	['event-modifiers', 'svelte/capturing'],
	['dom-event-forwarding', 'svelte/spreading-events']
]);

export async function load({ params }) {
	if (!params.slug || params.slug === 'svelte') redirect(307, '/tutorial/svelte/welcome-to-svelte');
	if (params.slug === 'kit') redirect(307, '/tutorial/kit/introducing-sveltekit');

	const r = redirects.get(params.slug);
	if (r) redirect(307, r);
	if (!params.slug.includes('/')) redirect(307, `/tutorial/svelte/${params.slug}`);

	return {
		exercise: await load_exercise(params.slug)
	};
}

export function entries() {
	// These are not findable by the router, but we need to know about them for redirects

	// So that old tutorial/... routes can redirect to new tutorial/svelte/...
	const entries = parts
		.filter((part) => !part.slug.includes('sveltekit'))
		.flatMap((part) => part.chapters)
		.flatMap((chapter) =>
			chapter.exercises.map((exercise) => ({ slug: exercise.slug.split('/').pop()! }))
		);

	// So that redirects from these URLs to /tutorial/<svelte/kit>/... work
	entries.push({ slug: 'svelte' }, { slug: 'kit' });

	return entries;
}
