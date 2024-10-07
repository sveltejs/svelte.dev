import { redirect } from '@sveltejs/kit';
import { load_exercise } from './content.server';

export const prerender = true;

const redirects = new Map([
	['reactive-assignments', 'state'],
	['reactive-declarations', 'derived-state'],
	['reactive-statements', 'effects'],
	['updating-arrays-and-objects', 'deep-state'],
	['event-modifiers', 'capturing'],
	['dom-event-forwarding', 'spreading-events']
]);

export async function load({ params }) {
	const r = redirects.get(params.slug);
	if (r) redirect(307, r);

	return {
		exercise: await load_exercise(params.slug)
	};
}
