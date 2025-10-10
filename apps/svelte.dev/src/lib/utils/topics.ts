export interface Topic {
	slug: string;
	title: string;
}

export const topics: Topic[] = [
	{ slug: 'svelte', title: 'Svelte' },
	{ slug: 'kit', title: 'SvelteKit' },
	{ slug: 'cli', title: 'Svelte CLI' },
	{ slug: 'mcp', title: 'Svelte MCP' }
];

export function get_topic_title(slug: string): string {
	const topic = topics.find((t) => t.slug === slug);
	return topic?.title ?? 'Svelte';
}
