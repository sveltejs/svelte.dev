import type { RequestHandler } from './$types';
import type { EntryGenerator } from './$types';
import { error } from '@sveltejs/kit';
import { documentsContent } from '$lib/server/content';

const packages = ['svelte', 'kit', 'cli'] as const;
type Package = (typeof packages)[number];

export const prerender = true;

export const entries: EntryGenerator = () => {
	return packages.map((type) => ({ path: type }));
};

function getPrefix(type: Package): string {
	const names = {
		svelte: 'Svelte',
		kit: 'SvelteKit',
		cli: 'Svelte CLI'
	};
	return `This is the developer documentation for ${names[type]}.`;
}

function filterDocs(allDocs: Record<string, string>, type: Package): Record<string, string> {
	const filtered: Record<string, string> = {};

	for (const [path, content] of Object.entries(allDocs)) {
		if (path.toLowerCase().includes(`/docs/${type}/`)) {
			filtered[path] = content;
		}
	}

	return filtered;
}

function sortPaths(paths: string[]): string[] {
	return paths.sort((a, b) => {
		const dirA = a.split('/').slice(0, -1).join('/');
		const dirB = b.split('/').slice(0, -1).join('/');

		if (dirA === dirB) {
			if (a.endsWith('index.md')) return -1;
			if (b.endsWith('index.md')) return 1;
			return a.localeCompare(b);
		}

		return dirA.localeCompare(dirB);
	});
}

function generateContent(filteredDocs: Record<string, string>, type: Package): string {
	let content = `<SYSTEM>${getPrefix(type)}</SYSTEM>\n\n`;

	const paths = sortPaths(Object.keys(filteredDocs));

	for (const path of paths) {
		content += `# ${path.replace('../../../content/', '')}\n\n`;
		content += filteredDocs[path];
		content += '\n';
	}

	return content;
}

export const GET: RequestHandler = async ({ params }) => {
	const packageType = params.path;

	if (!packages.includes(packageType as Package)) {
		error(404, 'Not Found');
	}

	const filteredDocs = filterDocs(documentsContent, packageType as Package);

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
