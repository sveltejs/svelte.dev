import { error } from '@sveltejs/kit';
import { docs } from '$lib/server/content.js';
import { generate_llm_content, get_documentation_title } from '$lib/server/llms';
import { topics } from '$lib/topics';

export const prerender = true;

export function entries() {
	return topics.map((topic) => {
		return { topic: topic.slug, path: '' };
	});
}

export function GET({ params }) {
	if (params.path) {
		const page = docs.pages[`docs/${params.topic}/${params.path}`];

		if (!page) {
			error(404, 'Not Found');
		}

		return new Response(page.body, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} else {
		const topic = topics.find((s) => s.slug === params.topic);

		if (!topic) {
			error(404, 'Not Found');
		}

		const prefix = `<SYSTEM>${get_documentation_title(topic)}</SYSTEM>`;
		const content = `${prefix}\n\n${generate_llm_content({ topics: [topic] })}`;

		return new Response(content, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
}
