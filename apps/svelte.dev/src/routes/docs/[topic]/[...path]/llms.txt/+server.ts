import { error } from '@sveltejs/kit';
import { generate_llm_content, get_documentation_title, sections } from '$lib/server/llms';

export const prerender = true;

export function entries() {
	return sections.map((section) => {
		const [topic, ...rest] = section.slug.split('/');
		return { topic, path: rest.join('/') };
	});
}

export function GET({ params }) {
	const pkg = params.path ? `${params.topic}/${params.path}` : params.topic;

	const section = sections.find((s) => s.slug === pkg);

	if (!section) {
		error(404, 'Not Found');
	}

	const prefix = `<SYSTEM>${get_documentation_title(section)}</SYSTEM>`;
	const content = `${prefix}\n\n${generate_llm_content({ sections: [section] })}`;

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
