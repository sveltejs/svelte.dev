import type { RequestHandler } from './$types';
import { documentsContent, getDocumentationStartTitle, sortPaths } from '$lib/server/content';

const PREFIX = 'This is the abridged developer documentation for Svelte and SvelteKit.';

export const GET: RequestHandler = async () => {
	let content = `${PREFIX}\n\n`;

	const paths = sortPaths(Object.keys(documentsContent));

	let currentSection = '';

	for (const path of paths) {
		let section = '';
		if (path.includes('/docs/svelte/')) section = getDocumentationStartTitle('svelte');
		else if (path.includes('/docs/kit/')) section = getDocumentationStartTitle('kit');
		else if (path.includes('/docs/cli/')) section = getDocumentationStartTitle('cli');
		else continue;

		if (section !== currentSection) {
			if (currentSection) content += '\n';
			content += `${section}\n\n`;
			currentSection = section;
		}

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
