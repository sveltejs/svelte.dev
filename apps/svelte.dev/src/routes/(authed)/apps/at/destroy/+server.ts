import { json_body, with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';
import { error } from '@sveltejs/kit';

export async function POST({ url, request, cookies }) {
	await with_user(cookies, async (user) => {
		const body = (await json_body(request)) as { ids?: unknown } | null;
		const ids = body?.ids;
		if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string'))
			error(400, 'ids required');
		return apps.destroy(url.origin, user, ids);
	});

	return new Response(undefined, { status: 204 });
}
