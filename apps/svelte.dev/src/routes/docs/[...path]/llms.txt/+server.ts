import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

const PREFIX = 'This is the filtered developer documentation for Svelte and SvelteKit.';

const packages = ['svelte', 'kit', 'cli'] as const;
type Package = (typeof packages)[number];

const docs = import.meta.glob<string>('../../../../../content/docs/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

function filterDocs(allDocs: Record<string, string>, type: Package) {
	const typePathMap = {
		svelte: 'svelte',
		kit: 'kit',
		cli: 'cli'
	} as const;

	return Object.entries(allDocs).reduce(
		(filtered, [path, content]) => {
			const normalizedPath = path.toLowerCase();
			if (normalizedPath.includes(`/docs/${typePathMap[type]}/`)) {
				filtered[path] = content;
			}
			return filtered;
		},
		{} as Record<string, string>
	);
}

function sortPaths(paths: string[]): string[] {
	return paths.sort((a, b) => {
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
	});
}

function generateContent(filteredDocs: Record<string, string>, type: Package): string {
	let content = `${PREFIX}\n\n# ${type} Documentation\n\n`;

	// Get all file paths and sort them
	const paths = sortPaths(Object.keys(filteredDocs));

	// Log for debugging
	console.log('Filtered paths:', paths);

	// Process each file
	for (const path of paths) {
		content += `## ${path.replace('../../../../../content/', '')}\n\n`;
		content += filteredDocs[path];
		content += '\n\n';
	}

	return content;
}

export const GET: RequestHandler = async ({ params }) => {
	// Extract the first part of the path (svelte, kit, or cli)
	const [packageType] = params.path.split('/');

	if (!packages.includes(packageType as Package)) {
		error(404, 'Not Found');
	}

	const filteredDocs = filterDocs(docs, packageType as Package);

	if (Object.keys(filteredDocs).length === 0) {
		error(404, 'No documentation found for this package');
	}

	const content = generateContent(filteredDocs, packageType as Package);

	return new Response(content, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

export const prerender = true;
