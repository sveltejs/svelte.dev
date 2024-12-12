import type { RequestHandler } from './$types';
import type { EntryGenerator } from './$types';
import { error } from '@sveltejs/kit';
import {
	documents_content,
	filter_docs_by_package,
	generate_llm_content,
	get_documentation_title,
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

	const filteredDocs = filter_docs_by_package(documents_content, packageType);

	if (Object.keys(filteredDocs).length === 0) {
		error(404, 'No documentation found for this package');
	}

	const PREFIX = `<SYSTEM>${get_documentation_title(packageType)}</SYSTEM>`;
	const content = `${PREFIX}\n\n${generate_llm_content(filteredDocs)}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
