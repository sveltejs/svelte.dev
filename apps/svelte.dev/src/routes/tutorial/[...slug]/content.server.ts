// @ts-expect-error has no types
import PrismJS from 'prismjs';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/components/prism-typescript.js';
import 'prism-svelte';
import { read } from '$app/server';
import { index } from '$lib/server/content';
import { transform } from '@sveltejs/site-kit/markdown';
import type { Exercise, ExerciseStub, PartStub, Scope } from '$lib/tutorial';
import { error } from '@sveltejs/kit';
import { text_files } from './shared';
import type { Document } from '@sveltejs/site-kit';
import { escape_html } from '$lib/utils/escape';
import type { Renderer } from 'marked';

const lookup: Record<
	string,
	{
		part: Document;
		chapter: Document;
		exercise: Document;
		assets: {
			a: Record<string, string>;
			b: Record<string, string>;
		};
		prev: ExerciseStub | null;
		next: ExerciseStub | null;
	}
> = {};

let prev: null | { slug: string; title: string } = null;

let files: Record<string, string> = {};

export function get_slug(part: Document, exercise: Document) {
	const topic = part.slug.split('/').pop()!.includes('sveltekit') ? 'kit' : 'svelte';
	return `tutorial/${topic}/${exercise.slug.split('/').pop()}`;
}

export const parts: PartStub[] = index.tutorial.children.map((part) => {
	return {
		slug: part.slug,
		title: part.metadata.title,
		chapters: part.children.map((chapter) => {
			return {
				slug: chapter.slug.split('/').pop()!,
				title: chapter.metadata.title,
				exercises: chapter.children.map((exercise) => {
					const slug = get_slug(part, exercise).slice('tutorial/'.length);

					const stub: ExerciseStub = {
						slug,
						title: exercise.metadata.title
					};

					// if exercise has an `app-a` directory, reset `files`, otherwise
					// inherit the starting state from the previous exercise's end state
					for (const key in exercise.assets) {
						if (key.startsWith('app-a/')) {
							files = {};
							break;
						}
					}

					const a = { ...files };
					const b: Record<string, string> = {};

					for (const key in exercise.assets) {
						const asset = exercise.assets[key];

						if (key.startsWith('app-a/')) {
							a[key.slice(6)] = asset;
						} else if (key.startsWith('app-b/')) {
							b[key.slice(6)] = asset;
						}
					}

					files = { ...a, ...b };

					// while we're here, populate the lookup
					lookup[slug] = { part, chapter, exercise, assets: { a, b }, prev, next: null };
					if (prev) lookup[prev.slug].next = stub;

					prev = stub;
					return stub;
				})
			};
		})
	};
});

async function get(assets: Record<string, string>, key: string) {
	const response = read(assets[key]);
	const match = /\.[^.]+$/.exec(key);
	const ext = match ? match[0] : '';

	return text_files.has(ext)
		? await response.text()
		: Buffer.from(await response.arrayBuffer()).toString('base64');
}

const languages = {
	bash: 'bash',
	env: 'bash',
	html: 'markup',
	svelte: 'svelte',
	js: 'javascript',
	css: 'css',
	diff: 'diff',
	ts: 'typescript',
	'': ''
};

const delimiter_substitutes = {
	'+++': '             ',
	'---': '           ',
	':::': '         '
};

function highlight_spans(content: string, classname: string) {
	return `<span class="${classname}">${content}</span>`;
	// return content.replace(/<span class="([^"]+)"/g, (_, classnames) => {
	// 	return `<span class="${classname} ${classnames}"`;
	// });
}

const default_renderer: Partial<Renderer> = {
	code: ({ text, lang = '' }) => {
		/** @type {Record<string, string>} */
		const options: Record<string, string> = {};

		let source = text
			.replace(/\/\/\/ (.+?)(?:: (.+))?\n/gm, (_, key, value) => {
				options[key] = value;
				return '';
			})
			.replace(/^([\-\+])?((?:    )+)/gm, (match, prefix = '', spaces) => {
				if (prefix && lang !== 'diff') return match;

				// for no good reason at all, marked replaces tabs with spaces
				let tabs = '';
				for (let i = 0; i < spaces.length; i += 4) {
					tabs += '\t';
				}
				return prefix + tabs;
			})
			.replace(/(\+\+\+|---|:::)/g, (_, delimiter: keyof typeof delimiter_substitutes) => {
				return delimiter_substitutes[delimiter];
			})
			.replace(/\*\\\//g, '*/');

		let html = '<div class="code-block"><div class="controls">';

		if (options.file) {
			html += `<span class="filename">${options.file}</span>`;
		}

		html += '</div>';

		if (lang === 'diff') {
			const lines = source.split('\n').map((content) => {
				let type = null;
				if (/^[\+\-]/.test(content)) {
					type = content[0] === '+' ? 'inserted' : 'deleted';
					content = content.slice(1);
				}

				return {
					type,
					content: escape_html(content)
				};
			});

			html += `<pre class="language-diff"><code>${lines
				.map((line) => {
					if (line.type) return `<span class="${line.type}">${line.content}\n</span>`;
					return line.content + '\n';
				})
				.join('')}</code></pre>`;
		} else {
			const plang = languages[lang as keyof typeof languages];
			const highlighted = plang
				? // TODO use shiki here rather than Prism?
					PrismJS.highlight(source, PrismJS.languages[plang], lang)
				: escape_html(source);

			html += `<pre class='language-${plang}'><code>${highlighted}</code></pre>`;
		}

		html += '</div>';

		return html
			.replace(/ {13}([^ ][^]+?) {13}/g, (_, content) => {
				return highlight_spans(content, 'highlight add');
			})
			.replace(/ {11}([^ ][^]+?) {11}/g, (_, content) => {
				return highlight_spans(content, 'highlight remove');
			})
			.replace(/ {9}([^ ][^]+?) {9}/g, (_, content) => {
				return highlight_spans(content, 'highlight');
			});
	}
};

export async function load_exercise(slug: string): Promise<Exercise> {
	if (!(slug in lookup)) {
		error(404, 'No such tutorial found');
	}

	const { part, chapter, exercise, assets, prev, next } = lookup[slug];

	const metadata = {
		...part.metadata,
		...chapter.metadata,
		...exercise.metadata
	};

	const scope = metadata.scope as Scope;
	const focus = metadata.focus as string;

	// TODO load part/chapter assets separately, not for each exercise?
	const common = {
		...index.tutorial.assets,
		...part.assets,
		...chapter.assets
	};

	const a: Record<string, string> = {};
	const b: Record<string, string> = {};

	for (const key in assets.a) {
		a[key] = await get(assets.a, key);
	}

	for (const key in assets.b) {
		b[key] = await get(assets.b, key);
	}

	for (const key in common) {
		if (!(key in a)) {
			a[key] = await read(common[key]).text();
		}
	}

	const filenames = new Set();

	return {
		part: {
			slug: part.slug,
			title: part.metadata.title,
			label: part.metadata.label
		},
		chapter: {
			slug: chapter.slug,
			title: chapter.metadata.title
		},
		scope,
		focus,
		title: exercise.metadata.title,
		path: (metadata.path as string) ?? '/',
		slug: exercise.slug,
		prev: prev && { slug: prev.slug },
		next,
		markdown: exercise.body,
		html: await transform(exercise.body, {
			...default_renderer,
			codespan: ({ text }) =>
				filenames.size > 1 && filenames.has(text)
					? `<code data-file="${scope.prefix + text}">${text}</code>`
					: `<code>${text}</code>`
		}),
		dir: exercise.file.split('/').slice(0, -1).join('/'),
		editing_constraints: {
			create: new Set(exercise.metadata.editing_constraints?.create ?? []),
			remove: new Set(exercise.metadata.editing_constraints?.remove ?? [])
		},
		a,
		b,
		has_solution: Object.keys(b).length > 0
	};
}
