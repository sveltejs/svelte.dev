import { mini_searchable_data, registry } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	return json(registry.map(mini_searchable_data));
}
