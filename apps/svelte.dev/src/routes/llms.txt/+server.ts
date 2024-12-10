import type { RequestHandler } from './$types';
import { documentsContent } from '$lib/server/content';

const PREFIX = 'This is the abridged developer documentation for Svelte and SvelteKit.';

// Sort function to ensure correct order (svelte -> kit -> cli)
function getSectionPriority(path: string): number {
	if (path.includes('/docs/svelte/')) return 0;
	if (path.includes('/docs/kit/')) return 1;
	if (path.includes('/docs/cli/')) return 2;
	return 3;
}

function comparePaths(a: string, b: string): number {
	// First compare by section
	const priorityA = getSectionPriority(a);
	const priorityB = getSectionPriority(b);
	if (priorityA !== priorityB) return priorityA - priorityB;

	// Get directory paths
	const dirA = a.split('/').slice(0, -1).join('/');
	const dirB = b.split('/').slice(0, -1).join('/');

	// If in the same directory, prioritize index.md
	if (dirA === dirB) {
		if (a.endsWith('index.md')) return -1;
		if (b.endsWith('index.md')) return 1;
		return a.localeCompare(b);
	}

	// Otherwise sort by directory path
	return dirA.localeCompare(dirB);
}

export const GET: RequestHandler = async () => {
	let content = `${PREFIX}\n\n`;

	// Get all file paths and sort them
	const paths = Object.keys(documentsContent).sort(comparePaths);

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
