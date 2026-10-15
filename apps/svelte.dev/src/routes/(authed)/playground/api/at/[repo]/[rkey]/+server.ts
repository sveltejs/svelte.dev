import * as apps from '#lib/atproto/apps.js';
import * as session from '#lib/atproto/session.js';
import { to_components } from '#lib/files.js';
import { error } from '@sveltejs/kit';

export async function GET({ url, params, cookies }) {
	const viewer = await session.from_cookies(cookies);
	const app = await apps.read(url.origin, params.repo, params.rkey, viewer);
	if (!app) error(404, 'not found');

	// same shape as the GitHub endpoint: `components`, not `files`
	const { files, ...rest } = app;
	return Response.json({ ...rest, relaxed: false, components: to_components(files) });
}
