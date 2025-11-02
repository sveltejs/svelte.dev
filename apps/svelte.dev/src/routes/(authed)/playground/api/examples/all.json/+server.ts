import { json } from '@sveltejs/kit';
import { get_all_examples } from '../../../data.remote';

export const prerender = true;

// TODO do we still need this?

// TODO move this into examples.json once we have fixed this SvelteKit bug:
// [id].json/+server.ts contained a fetch to examples.json, but it did not turn up here and instead recursed to itself.

// Examples are prerendered to avoid making FS requests at runtime,
// things needing the examples data will need to go through this endpoint
export async function GET() {
	return json(await get_all_examples());
}
