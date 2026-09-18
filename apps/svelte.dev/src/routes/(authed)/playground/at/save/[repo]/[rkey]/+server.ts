import { parse_input, with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';

export async function PUT({ url, request, cookies, params }) {
	const body = await request.json();
	await with_user(cookies, (user) =>
		apps.update(url.origin, user, `${params.repo}/${params.rkey}`, parse_input(body))
	);

	return new Response(undefined, { status: 204 });
}
