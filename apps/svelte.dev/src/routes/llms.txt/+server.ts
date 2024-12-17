import { get_documentation_title, sections } from '$lib/server/llms';
import template from './template.md?raw';

const DOMAIN = `https://svelte.dev`;

export const prerender = true;

export function GET() {
	const package_docs = sections.map(
		(section) =>
			`- [${section.title} documentation](${DOMAIN}/docs/${section.slug}/llms.txt): ${get_documentation_title(section)}`
	);

	const content = template.replace('%PACKAGE_DOCS%', package_docs.join('\n'));

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
