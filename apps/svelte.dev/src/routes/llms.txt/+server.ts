import { read } from '$app/server';
import type { RequestHandler } from './$types';

// Import all markdown files
const docs = import.meta.glob<string>('../../../content/docs/**/*.md', {
	eager: true,
	query: '?raw'
});

// Sort function to ensure correct order (svelte -> kit -> cli)
function getSectionPriority(path: string): number {
	if (path.includes('/docs/svelte/')) return 0;
	if (path.includes('/docs/kit/')) return 1;
	if (path.includes('/docs/cli/')) return 2;
	return 3;
}

export const GET: RequestHandler = async () => {
	let content = '';

	// Get all file paths and sort them
	const paths = Object.keys(docs).sort((a, b) => {
		const priorityA = getSectionPriority(a);
		const priorityB = getSectionPriority(b);
		if (priorityA !== priorityB) return priorityA - priorityB;
		return a.localeCompare(b);
	});

	let currentSection = '';

	// Process each file
	for (const path of paths) {
		// Determine section
		let section = '';
		if (path.includes('/docs/svelte/')) section = 'SVELTE DOCS';
		else if (path.includes('/docs/kit/')) section = 'SVELTEKIT DOCS';
		else if (path.includes('/docs/cli/')) section = 'CLI DOCS';
		else continue; // Skip other content

		// Add section header if we're entering a new section
		if (section !== currentSection) {
			if (currentSection) content += '\n\n';
			content += '=====================================\n';
			content += `============ ${section} ===========\n`;
			content += '=====================================\n\n';
			currentSection = section;
		}

		// Add file path and content
		content += `File: ${path.replace('../../../content/', '')}\n\n`;
		content += docs[path];
		content += '\n\n-------------------\n\n';
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
