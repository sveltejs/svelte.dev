import * as apps from '#lib/atproto/apps.js';
import { to_components } from '#lib/files.js';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
	const app = await apps.read(params.repo, params.rkey);
	if (!app) error(404, 'not found');

	// same shape as the GitHub endpoint: `components`, not `files`
	const { files, ...rest } = app;
	return Response.json({ ...rest, relaxed: false, components: to_components(files) });
}
