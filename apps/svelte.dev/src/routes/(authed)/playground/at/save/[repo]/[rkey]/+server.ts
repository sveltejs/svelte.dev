import { json_body, parse_input, with_user } from '#lib/atproto/endpoint.js';
import * as apps from '#lib/atproto/apps.js';

export async function PUT({ url, request, cookies, params }) {
	await with_user(cookies, async (user) => {
		const input = parse_input(await json_body(request));
		return apps.update(url.origin, user, `${params.repo}/${params.rkey}`, input);
	});

	return new Response(undefined, { status: 204 });
}
