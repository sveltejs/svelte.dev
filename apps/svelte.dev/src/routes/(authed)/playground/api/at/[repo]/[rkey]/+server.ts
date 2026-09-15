import * as at from '#lib/atproto/public.js';
import { error, json } from '@sveltejs/kit';

export const prerender = false;

export async function GET({ params }) {
	const app = await at.read(params.repo, params.rkey);
	if (!app) error(404, 'not found');

	return json({
		...app,
		relaxed: false,
		components: app.files.map((file) => {
			const dot = file.name.lastIndexOf('.');
			return { name: file.name.slice(0, dot), type: file.name.slice(dot + 1), source: file.source };
		})
	});
}
