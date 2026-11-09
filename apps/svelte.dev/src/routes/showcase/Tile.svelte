<!--@component
a site in the list: its screenshot, linking to it, with its name and description under it, or in
compact rows its name over the screenshot as you point at, focus or tap it. what holds it can set
--lift, the z-index it takes while pointed at or focused, to rise above anything laid over the list
-->
<script lang="ts">
	import type { Clips } from './clips.svelte.ts';
	import { fade_in } from './fade-in.ts';
	import { lengthen } from './glance.ts';
	import { clips, pictures, placeholders, scrolling } from './media.ts';
	import Screenshot from './Screenshot.svelte';
	import type { Site } from './sites.ts';

	interface Props {
		site: Site;
		sizes: string;
		player: Clips;
		/** taller to fill the rows it spans, with larger type */
		large?: boolean;
		/** only the screenshot, with the name over it, as in the rows of the many more */
		compact?: boolean;
		/** loads nothing more on hover or focus, to save data */
		still?: boolean;
	}

	let { site, sizes, player, large = false, compact = false, still = false }: Props = $props();

	/** a still one never loads its whole screenshot, nor a clip that scrolls down the page */
	const moves = $derived(!!clips[site.id] && !(still && scrolling.has(site.id)));

	/** the screenshot in the link */
	function thumb_of(event: FocusEvent) {
		return (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.thumb')!;
	}
</script>

<a
	class={['tile', { large, compact }]}
	href={site.url}
	onpointerenter={(event) => (still ? moves : true) && lengthen(event, site.id, player)}
	onfocus={(event) => moves && player.focus(thumb_of(event), site.id)}
	onblur={(event) => moves && player.release(thumb_of(event))}
	{@attach fade_in}
>
	<span
		class="thumb"
		style:--position={site.screenshot?.position}
		style:--placeholder={placeholders[site.id]}
		{@attach clips[site.id] && !scrolling.has(site.id) ? player.in_view(site.id) : undefined}
	>
		{#if pictures[site.id]}
			<Screenshot id={site.id} {sizes} clip={moves} />
		{/if}

		{#if compact}
			<!-- over the screenshot, shown as you point at, focus or tap it -->
			<span class="label">{site.name}</span>
		{/if}
	</span>

	{#if !compact}
		<span class="text">
			<span class="name">{site.name}</span>
			<span class="description" lang={site.lang}>{site.description}</span>
		</span>
	{/if}
</a>

<style>
	/* the screenshot, the name and description under it */
	.tile {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr;
		align-content: start;
		gap: 1.2rem;
		height: 100%;
		color: var(--sk-fg-1);
		text-decoration: none;

		/* above whatever is laid over the list, while pointed at or focused */
		&:is(:hover, :focus-visible) {
			z-index: var(--lift, auto);
		}

		/* the name only, as links elsewhere on the site, rather than the description too */
		&:hover {
			text-decoration: none;

			.name {
				text-decoration: underline;
			}
		}

		/* where it is large, taller than 16:10 to fill the rows it spans beside the smaller ones, so
		   the mosaic has no holes, about the 6:5 its clip is taken at, so little of it is cut, and
		   elsewhere 16:10 like the rest, so the screenshots in a row line up */
		&.large {
			@media (min-width: 740px) {
				grid-template-rows: 1fr auto;
			}
		}

		/* only the screenshot, with no row for text below it to add to the gap */
		&.compact {
			gap: 0;
		}
	}

	/* the name and description under the screenshot */
	.text {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;

		.name {
			font: 400 clamp(1.8rem, 1.5rem + 0.4vw, 2.2rem) / 1.15 var(--sk-font-family-heading);
		}

		.large & .name {
			@media (min-width: 740px) {
				font-size: clamp(2.4rem, 1.8rem + 1.2vw, 3.6rem);
			}
		}

		.description {
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
		}

		.large & .description {
			@media (min-width: 740px) {
				font: var(--sk-font-body);
			}
		}
	}

	.thumb {
		position: relative;
		grid-area: 1 / 1;
		display: block;
		overflow: hidden;
		color: #fff;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);

		/* pressed in a little as it is clicked, felt before the page leaves for the site */
		transition: scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

		.tile:active & {
			scale: 0.98;
		}

		/* 16:10 by padding, so the large ones can be as tall as their rows instead */
		&::before {
			content: '';
			display: block;
			padding-top: 62.5%;
		}

		/* its clip shown once it moves */
		&:global([data-playing]) {
			--clip-opacity: 1;
			--clip-fade: 0.2s;
		}
	}

	/* the name over the bottom of the screenshot, only on the one you point at, focus or tap */
	.label {
		position: absolute;
		inset: auto 0 0;
		z-index: 1;
		padding: 3.2rem 1.2rem 1rem;
		font: 400 clamp(1.6rem, 1.4rem + 0.4vw, 2rem) / 1.1 var(--sk-font-family-heading);
		background: linear-gradient(transparent, rgb(0 0 0 / 0.65));
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease;

		.tile:is(:focus-visible, :active) & {
			opacity: 1;
		}

		@media all and not (hover: none) {
			.tile:hover & {
				opacity: 1;
			}
		}

		/* smaller type in the smaller ones */
		@container (width < 20rem) {
			padding: 2.4rem 0.8rem 0.6rem;
			font-size: 1.6rem;
		}
	}
</style>
