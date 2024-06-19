import { load_exercise } from './content.server';

export const prerender = true;

export async function load({ params }) {
	return {
		exercise: await load_exercise(params.slug)
	};
}
