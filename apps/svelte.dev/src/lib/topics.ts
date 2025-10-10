export interface Topic {
	slug: string;
	title: string;
}

export const topics = [
	{ slug: 'svelte', title: 'Svelte' },
	{ slug: 'kit', title: 'SvelteKit' },
	{ slug: 'cli', title: 'Svelte CLI' },
	{ slug: 'mcp', title: 'Svelte MCP' }
] as const satisfies Topic[];

const DEFAULT_TITLE = 'Svelte';

export function get_topic_title(slug: string | undefined): string {
	if (!slug) return DEFAULT_TITLE;
	const topic = topics.find((t) => t.slug === slug);
	return topic?.title ?? DEFAULT_TITLE;
}
