import { error } from '@sveltejs/kit';
import {
	documents_content,
	filter_docs_by_package,
	generate_llm_content,
	get_documentation_title,
	packages
} from '$lib/server/content';

export const prerender = true;

export function entries() {
	return packages.map((type) => ({ path: type }));
}

export function GET({ params }) {
	const package_type = params.path;

	if (!packages.includes(package_type)) {
		error(404, 'Not Found');
	}

	const filtered_docs = filter_docs_by_package(documents_content, package_type);

	if (Object.keys(filtered_docs).length === 0) {
		error(404, 'No documentation found for this package');
	}

	const prefix = `<SYSTEM>${get_documentation_title(package_type)}</SYSTEM>`;
	const content = `${prefix}\n\n${generate_llm_content(filtered_docs)}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
