import type { RequestHandler } from './$types';
import { documentsContent, sortPaths } from '$lib/server/content';

const PREFIX = 'This is the abridged developer documentation for Svelte and SvelteKit.';

export const GET: RequestHandler = async () => {
	let content = `${PREFIX}\n\n`;

	// Get all file paths and sort them
	const paths = sortPaths(Object.keys(documentsContent));

	let currentSection = '';

	// Process each file
	for (const path of paths) {
		// Determine section
		let section = '';
		if (path.includes('/docs/svelte/')) section = 'Svelte documentation';
		else if (path.includes('/docs/kit/')) section = 'SvelteKit documentation';
		else if (path.includes('/docs/cli/')) section = 'Svelte CLI documentation';
		else continue; // Skip other content

		// Add section header if we're entering a new section
		if (section !== currentSection) {
			if (currentSection) content += '\n';
			content += `# Start of ${section}\n\n`;
			currentSection = section;
		}

		// Add file path and content
		content += `## ${path.replace('../../../content/', '')}\n\n`;
		content += documentsContent[path];
		content += '\n';
	}

	const headers: HeadersInit = {
		'Content-Type': 'text/plain; charset=utf-8',
		'Cache-Control': 'public, max-age=3600'
	};

	return new Response(content, {
		status: 200,
		headers
	});
};

export const prerender = true;
