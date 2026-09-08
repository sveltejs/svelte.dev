import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

interface HeaderRule {
	source: string;
	headers: Array<{ key: string; value: string }>;
}

const domain = 'https://svelte.dev';
const project_directory = existsSync(join(process.cwd(), 'content', 'docs'))
	? process.cwd()
	: join(process.cwd(), 'apps', 'svelte.dev');
const docs_directory = join(project_directory, 'content', 'docs');

export function create_llms_canonical(directory = docs_directory): HeaderRule[] {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')
		.map((entry) => {
			const relative_path = `${entry.parentPath.slice(directory.length + 1)}/${entry.name}`;
			const [topic, section, file, extra] = relative_path.split('/');

			if (!topic || !section || !file || extra) return null;

			const page = file.replace(/^\d+-/, '').replace(/\.md$/, '');
			const canonical = `${domain}/docs/${topic}/${page}`;

			return {
				source: `/docs/${topic}/${page}/llms.txt`,
				headers: [{ key: 'Link', value: `<${canonical}>; rel="canonical"` }]
			};
		})
		.filter((header) => header !== null)
		.sort((a, b) => a.source.localeCompare(b.source));
}

export const config = {
	rewrites: [
		{
			source: '/opencode/schema.json',
			destination:
				'https://raw.githubusercontent.com/sveltejs/ai-tools/refs/heads/main/packages/opencode/schema.json'
		}
	],
	headers: [
		{
			source: '/_app/immutable/workers/(.*)',
			headers: [
				{ key: 'cross-origin-opener-policy', value: 'same-origin' },
				{ key: 'cross-origin-embedder-policy', value: 'require-corp' },
				{ key: 'cross-origin-resource-policy', value: 'cross-origin' }
			]
		},
		{
			source: '/tutorial/kit/(.*)',
			headers: [
				{ key: 'cross-origin-opener-policy', value: 'same-origin' },
				{ key: 'cross-origin-embedder-policy', value: 'require-corp' },
				{ key: 'cross-origin-resource-policy', value: 'cross-origin' }
			]
		},
		...create_llms_canonical()
	],
	git: {
		deploymentEnabled: {
			next: false
		}
	}
};
