import type { RequestHandler } from './$types';
import type { EntryGenerator } from './$types';
import { error } from '@sveltejs/kit';
import {
	documentsContent,
	filterDocsByPackage,
	generateLlmContent,
	getDocumentationTitle,
	packages
} from '$lib/server/content';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return packages.map((type) => ({ path: type }));
};

export const GET: RequestHandler = async ({ params }) => {
	const packageType = params.path;

	if (!packages.includes(packageType)) {
		error(404, 'Not Found');
	}

	const filteredDocs = filterDocsByPackage(documentsContent, packageType);

	if (Object.keys(filteredDocs).length === 0) {
		error(404, 'No documentation found for this package');
	}

	const PREFIX = `<SYSTEM>${getDocumentationTitle(packageType)}</SYSTEM>`;
	const content = `${PREFIX}\n\n${generateLlmContent(filteredDocs)}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
