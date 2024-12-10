import type { RequestHandler } from './$types';
// TODO: figure this out
// import { index } from '$lib/server/content';
import { error, json } from '@sveltejs/kit';

const packages = ['svelte', 'kit', 'cli'];

export const prerender = true;

function filterDocs(allDocs: Record<string, { default: string }>, type: string) {
	const typePathMap = {
		svelte: '/docs/svelte/',
		kit: '/docs/kit/',
		cli: '/docs/cli/'
	} as const;

	return Object.entries(allDocs).reduce(
		(filtered, [path, content]) => {
			if (path.includes(typePathMap[type as keyof typeof typePathMap])) {
				filtered[path] = content;
			}
			return filtered;
		},
		{} as Record<string, { default: string }>
	);
}

export const GET: RequestHandler = async ({ params }) => {
	const currentPackage = params.path;

	if (!packages.includes(currentPackage)) {
		error(404, {
			message: 'Not Found'
		});
	}

	const headers: HeadersInit = {
		'Content-Type': 'text/plain; charset=utf-8',
		'Cache-Control': 'public, max-age=3600'
	};

	return new Response('hello', {
		status: 200,
		headers
	});
};
