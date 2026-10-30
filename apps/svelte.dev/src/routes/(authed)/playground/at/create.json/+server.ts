import { json_body, parse_input, with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';
import { json } from '@sveltejs/kit';

export async function POST({ url, request, cookies }) {
	const result = await with_user(cookies, async (user) => {
		const body = (await json_body(request)) as { private?: unknown } | null;
		return apps.create(url.origin, user, parse_input(body), body?.private === true);
	});

	return json(result, { status: 201 });
}
