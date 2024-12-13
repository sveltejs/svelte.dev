import { error } from '@sveltejs/kit';
import { generate_llm_content, get_documentation_title, packages } from '$lib/server/llms';

export const prerender = true;

export function entries() {
	return packages.map((type) => ({ path: type }));
}

export function GET({ params }) {
	const pkg = params.path;

	if (!packages.includes(pkg)) {
		error(404, 'Not Found');
	}

	const prefix = `<SYSTEM>${get_documentation_title(pkg)}</SYSTEM>`;
	const content = `${prefix}\n\n${generate_llm_content({ package: pkg })}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
