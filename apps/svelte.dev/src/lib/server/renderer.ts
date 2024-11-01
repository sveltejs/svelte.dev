import { render_content_markdown } from '@sveltejs/site-kit/markdown';

export const render_content = (
	filename: string,
	body: string,
	options: { check?: boolean } = {}
) => {
	return render_content_markdown(filename, body, options, (filename, source) => {
		// TODO these are copied from Svelte and SvelteKit - adjust for new filenames
		const injected = [];

		if (/(svelte)/.test(source) || filename.includes('typescript')) {
			injected.push(`// @filename: ambient.d.ts`, `/// <reference types="svelte" />`);
		}

		if (filename.includes('svelte-compiler')) {
			injected.push('// @esModuleInterop');
		}

		if (filename.includes('svelte.md')) {
			injected.push('// @errors: 2304');
		}

		// Actions JSDoc examples are invalid. Too many errors, edge cases
		// d.ts files are not properly supported right now, fix this later
		if (filename.includes('svelte-action') || source.includes(' declare const ')) {
			injected.push('// @noErrors');
		}

		if (filename.includes('typescript')) {
			injected.push('// @errors: 2304');
		}

		if (
			source.includes('$app/') ||
			source.includes('$service-worker') ||
			source.includes('@sveltejs/kit/')
		) {
			injected.push(`// @filename: ambient-kit.d.ts`, `/// <reference types="@sveltejs/kit" />`);
		}

		if (source.includes('$env/')) {
			// TODO we're hardcoding static env vars that are used in code examples
			// in the types, which isn't... totally ideal, but will do for now
			injected.push(
				`declare module '$env/dynamic/private' { export const env: Record<string, string> }`,
				`declare module '$env/dynamic/public' { export const env: Record<string, string> }`,
				`declare module '$env/static/private' { export const API_KEY: string }`,
				`declare module '$env/static/public' { export const PUBLIC_BASE_URL: string }`
			);
		}

		if (source.includes('./$types') && !source.includes('@filename: $types.d.ts')) {
			injected.push(
				`// @filename: $types.d.ts`,
				`import type * as Kit from '@sveltejs/kit';`,
				`export type PageLoad = Kit.Load<Record<string, any>>;`,
				`export type PageServerLoad = Kit.ServerLoad<Record<string, any>>;`,
				`export type LayoutLoad = Kit.Load<Record<string, any>>;`,
				`export type LayoutServerLoad = Kit.ServerLoad<Record<string, any>>;`,
				`export type RequestHandler = Kit.RequestHandler<Record<string, any>>;`,
				`export type Action = Kit.Action<Record<string, any>>;`,
				`export type Actions = Kit.Actions<Record<string, any>>;`,
				`export type EntryGenerator = () => Promise<Array<Record<string, any>>> | Array<Record<string, any>>;`
			);
		}

		// special case — we need to make allowances for code snippets coming
		// from e.g. ambient.d.ts
		if (filename.endsWith('$env-all.md') || filename.endsWith('$app-forms.md')) {
			injected.push('// @errors: 7006 7031');
		}

		if (filename.endsWith('10-configuration.md')) {
			injected.push('// @errors: 2307');
		}

		// another special case
		if (source.includes('$lib/types')) {
			injected.push(`declare module '$lib/types' { export interface User {} }`);
		}

		return injected.join('\n');
	});
};
