<script lang="ts">
	interface PostStub {
		authors: Array<{ name: string; url: string }>;
		date: string;
		date_formatted: string;
	}

	let { post }: { post: PostStub } = $props();
</script>

<p class="byline">
	{#each post.authors as author, i}
		{@const show_comma = post.authors.length > 2 && i < post.authors.length - 1}
		{@const show_and = i === post.authors.length - 2}
		<svelte:element this={author.url ? 'a' : 'span'} href={author.url}>{author.name}</svelte:element
		>{#if show_comma},&nbsp;{/if}
		{#if show_and}and&nbsp;{/if}
	{/each}
	<time datetime={post.date}>{post.date_formatted}</time>
</p>

<style>
	.byline {
		padding: 1rem 0 0 0;
		font: var(--sk-font-ui-small);
		text-transform: uppercase;
	}
</style>
