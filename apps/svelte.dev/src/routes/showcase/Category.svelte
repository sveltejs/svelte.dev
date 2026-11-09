<!--@component
a section of the list under its heading, which links land on
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		title: string;
		children: Snippet;
	}

	let { id, title, children }: Props = $props();
</script>

<section class="category" aria-labelledby={id}>
	<h2 {id}>{title}</h2>
	{@render children()}
</section>

<style>
	.category {
		margin: 9.6rem 0 0 0;

		@media (min-width: 1024px) {
			margin-top: 14.4rem;
		}
	}

	h2 {
		margin: 0 0 3.2rem 0;
		font: 400 clamp(3.6rem, 2.4rem + 2vw, 5.6rem) / 1.05 var(--sk-font-family-heading);
		color: var(--sk-fg-1);
		text-wrap: balance;
		scroll-margin-top: var(--anchor-offset);
	}
</style>
