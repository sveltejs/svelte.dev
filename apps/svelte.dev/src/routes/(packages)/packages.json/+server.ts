import { registry } from '$lib/server/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	return json(registry);
}
