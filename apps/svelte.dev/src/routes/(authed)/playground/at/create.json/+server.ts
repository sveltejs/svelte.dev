import { parse_input, with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';
import { json } from '@sveltejs/kit';

export async function POST({ url, request, cookies }) {
	const body = await request.json();
	const result = await with_user(cookies, (user) =>
		apps.create(url.origin, user, parse_input(body), body?.private === true)
	);

	return json(result, { status: 201 });
}
