import {
	get_documentation_title,
	remove_llm_ignore_blocks,
	remove_playground_links
} from '$lib/server/llms';
import { topics } from '$lib/topics';
import template from './template.md?raw';

const DOMAIN = `https://svelte.dev`;

export const prerender = true;

export function GET() {
	const package_docs = topics.map(
		(topic) =>
			`- [${topic.title} documentation](${DOMAIN}/docs/${topic.slug}/llms.txt): ${get_documentation_title(topic)}`
	);

	const content = template.replace('%PACKAGE_DOCS%', package_docs.join('\n'));

	return new Response(remove_playground_links(remove_llm_ignore_blocks(content)), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
