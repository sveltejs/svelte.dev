import { index } from '$lib/server/content';
import { json } from '@sveltejs/kit';

// Temporary workaround for the problem described in [code]/+page.server.ts
// In a nested folder because of https://github.com/sveltejs/kit/issues/12778

const reference = index['docs/svelte/reference'].children.filter(
	(child) => child.slug.endsWith('-errors') || child.slug.endsWith('-warnings')
);

// Since codes are not top level section we gotta jump through some hoops to get the right hash

const codes: Record<string, Record<string, string[]>> = {};

for (const page of reference) {
	const grouped: Record<string, string[]> = {};
	const sections = page.body.split(/(^|\n)## /g);

	if (sections.length > 1) {
		sections.shift();
	}

	for (const section of sections) {
		const lines = section.slice(section.startsWith('\n') ? 1 : 0).split('\n');
		const h2 = lines.shift()?.trim();

		const h3_titles = lines
			.filter((line) => line.startsWith('### '))
			.map((line) => line.slice(4).trim());

		if (h3_titles.length > 0) {
			grouped[page.sections.find((s) => s.title === h2)?.slug ?? ''] = h3_titles;
		}
	}

	codes[page.slug] = grouped;
}

export const prerender = true;

export function GET() {
	return json(codes);
}
