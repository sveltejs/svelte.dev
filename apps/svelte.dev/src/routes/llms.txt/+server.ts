import { VERCEL_URL } from '$env/static/private';
import { get_documentation_title, packages, DOCUMENTATION_NAMES } from '$lib/server/content';

export const prerender = true;

export function GET() {
	const package_docs = packages
		.map(
			(pkg) =>
				`- [${DOCUMENTATION_NAMES[pkg]} documentation](${VERCEL_URL}/docs/${pkg}/llms.txt): ${get_documentation_title(pkg)}`
		)
		.join('\n');

	const content = `# Svelte Documentation for LLMs

> Svelte is a UI framework that uses a compiler to let you write breathtakingly concise components that do minimal work in the browser, using languages you already know — HTML, CSS and JavaScript.

## Documentation Sets

- [Abridged documentation](${VERCEL_URL}/llms-small.txt): A minimal version of the Svelte and SvelteKit documentation, with examples and non-essential content removed
- [Complete documentation](${VERCEL_URL}/llms-full.txt): The complete Svelte and SvelteKit documentation including all examples and additional content

## Individual Package Documentation

${package_docs}

## Notes

- The abridged documentation excludes legacy compatibility notes, detailed examples, and supplementary information
- The complete documentation includes all content from the official documentation
- Package-specific documentation files contain only the content relevant to that package
- The content is automatically generated from the same source as the official documentation`;

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
