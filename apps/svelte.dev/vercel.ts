import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { routes, type VercelConfig, type HeaderRule } from '@vercel/config/v1';

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

			return routes.header(`/docs/${topic}/${page}/llms.txt`, [
				{ key: 'Link', value: `<${canonical}>; rel="canonical"` }
			]);
		})
		.filter((header) => header !== null)
		.sort((a, b) => a.source.localeCompare(b.source));
}

export const config: VercelConfig = {
	rewrites: [
		routes.rewrite(
			'/opencode/schema.json',
			'https://raw.githubusercontent.com/sveltejs/ai-tools/refs/heads/main/packages/opencode/schema.json'
		)
	],
	headers: [
		routes.header(
			'/(.*)',
			process.env.VERCEL_GIT_COMMIT_REF === 'main'
				? []
				: [{ key: 'X-Robots-Tag', value: 'noindex' }]
		),
		routes.header('/_app/immutable/workers/(.*)', [
			// the tutorial sandbox loads its worker (and the worker's assets) cross-origin
			{ key: 'access-control-allow-origin', value: '*' },
			{ key: 'cross-origin-opener-policy', value: 'same-origin' },
			{ key: 'cross-origin-embedder-policy', value: 'require-corp' },
			{ key: 'cross-origin-resource-policy', value: 'cross-origin' }
		]),
		routes.header('/tutorial/kit/(.*)', [
			{ key: 'cross-origin-opener-policy', value: 'same-origin' },
			{ key: 'cross-origin-embedder-policy', value: 'require-corp' },
			{ key: 'cross-origin-resource-policy', value: 'cross-origin' }
		]),
		...create_llms_canonical()
	],
	...(process.env.VERCEL_GIT_COMMIT_REF === 'main'
		? { git: { deploymentEnabled: { next: false } } }
		: {})
};
