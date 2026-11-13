<!--@component
a site in the list: its screenshot, linking to it, with its name and description under it, or in
compact rows its name over the screenshot as you point at, focus or tap it. what holds it has the
site's id, for links to land on
-->
<script lang="ts">
	import { fade_in } from './fade-in.ts';
	import { lengthen } from './glance.ts';
	import { clips, placeholders, scrolling } from './media.ts';
	import { get_player } from './player.svelte.ts';
	import Screenshot from './Screenshot.svelte';
	import type { Site } from './sites.ts';

	interface Props {
		site: Site;
		sizes: string;
		/** taller to fill the rows it spans, with larger type */
		large?: boolean;
		/** only the screenshot, with the name over it, as in the rows of the many more */
		compact?: boolean;
		/** never loads its whole screenshot, nor a clip that scrolls down the page, to save data */
		still?: boolean;
		/** one shown a second time, which the keyboard and screen readers pass over */
		copy?: boolean;
	}

	let {
		site,
		sizes,
		large = false,
		compact = false,
		still = false,
		copy = false
	}: Props = $props();

	const player = get_player();

	/** whether it has a clip to play */
	const moves = $derived(!!clips[site.id] && !(still && scrolling.has(site.id)));

	let frame: HTMLElement;
</script>

<a
	class={['tile', { large, compact }]}
	href={site.url}
	tabindex={copy ? -1 : undefined}
	onpointerenter={(event) => (moves || !still) && lengthen(event, frame, site.id, player)}
	onfocus={() => moves && player.focus(frame, site.id)}
	onblur={() => moves && player.release(frame)}
	{@attach fade_in}
>
	<span
		class="thumb frame"
		bind:this={frame}
		style:--position={site.screenshot?.position}
		style:--placeholder={placeholders[site.id]}
		{@attach clips[site.id] && !scrolling.has(site.id) ? player.in_view(site.id) : undefined}
	>
		<Screenshot id={site.id} {sizes} clip={moves} />

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

		/* the name only, as links elsewhere on the site, rather than the description too */
		&:hover {
			text-decoration: none;

			.name {
				text-decoration: underline;
			}
		}

		/* where it is large, the screenshot is as tall as the rows it spans beside the smaller ones
		   leave it, rather than 16:10, so the mosaic has no holes. about the 6:5 its clip is taken
		   at, so little of it is cut */
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

		/* pressed in a little as it is clicked, felt before the page leaves for the site */
		transition: scale 0.15s var(--quad-out);

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

	/* registered as a colour, so the shade behind the name can fade */
	@property --shade {
		syntax: '<color>';
		inherits: false;
		initial-value: transparent;
	}

	/* the name over the bottom of the screenshot, only on the one you point at, focus or tap. faded
	   in by its colours rather than its opacity, which gives the screenshot a layer of its own
	   while it fades, and safari then draws it a fraction of a pixel off until it is done */
	.label {
		position: absolute;
		inset: auto 0 0;
		z-index: 1;
		padding: 3.2rem 1.2rem 1rem;
		font: 400 clamp(1.6rem, 1.4rem + 0.4vw, 2rem) / 1.1 var(--sk-font-family-heading);
		color: transparent;
		background: linear-gradient(transparent, var(--shade));
		pointer-events: none;
		transition:
			color 0.15s ease,
			--shade 0.15s ease;

		.tile:is(:focus-visible, :active) & {
			--shade: rgb(0 0 0 / 0.65);
			color: inherit;
		}

		@media (hover: hover) and (pointer: fine) {
			.tile:hover & {
				--shade: rgb(0 0 0 / 0.65);
				color: inherit;
			}
		}

		/* smaller type in the smaller ones */
		@container (width < 20rem) {
			padding: 2.4rem 0.8rem 0.6rem;
			font-size: 1.6rem;
		}
	}
</style>
