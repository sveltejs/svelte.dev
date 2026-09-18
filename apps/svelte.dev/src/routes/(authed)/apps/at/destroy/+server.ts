import { with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';
import { error } from '@sveltejs/kit';

export async function POST({ url, request, cookies }) {
	const body = await request.json();
	const ids: unknown = body?.ids;
	if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) error(400, 'ids required');

	await with_user(cookies, (user) => apps.destroy(url.origin, user, ids));

	return new Response(undefined, { status: 204 });
}
