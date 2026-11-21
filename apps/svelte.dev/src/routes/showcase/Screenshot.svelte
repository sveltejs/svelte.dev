<!--@component
the top of a site's screenshot, filling whatever holds it, with its clip over it if it has one,
which is only loaded once it plays. what holds it has the class `frame`, and sets --position and
--placeholder, and --clip-opacity to 1 while the clip plays. the morph, the glance down it on
hover and the player find the parts of it by their classes, so those stay as they are
-->
<script lang="ts">
	import type { HTMLVideoAttributes } from 'svelte/elements';
	import { clips, cropped } from './media.ts';

	interface Props {
		id: string;
		sizes: string;
		loading?: 'eager' | 'lazy';
		/** whether to play its clip over it, if it has one */
		clip?: boolean;
		/** more for the clip, such as what to do as it plays, or `loop: false` */
		video?: HTMLVideoAttributes;
	}

	let { id, sizes, loading = 'lazy', clip = false, video }: Props = $props();

	const picture = $derived(cropped[id]);
</script>

<picture class="slide">
	{#each Object.entries(picture.sources) as [format, srcset] (format)}
		<source {srcset} {sizes} type="image/{format}" />
	{/each}
	<img
		class="image"
		src={picture.img.src}
		width={picture.img.w}
		height={picture.img.h}
		alt=""
		{loading}
	/>
</picture>

{#if clip && clips[id]}
	<!-- loaded only once it plays -->
	<video
		class="clip"
		muted
		loop
		playsinline
		disablepictureinpicture
		disableremoteplayback
		preload="none"
		aria-hidden="true"
		{...video}
	></video>
{/if}

<style>
	.slide {
		position: absolute;
		inset: 0;
		display: block;
	}

	.image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--position, left top);
		transition: opacity 0.25s var(--quint-out);
	}

	/* the whole screenshot at its full height once it loads in place of the top of it, for the
	   glance down it on hover */
	.image:global([data-long='loaded']) {
		height: auto;
	}

	/* over the screenshot, faded in once it moves, a little slower than it goes */
	.clip {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--position, left top);
		opacity: var(--clip-opacity, 0);
		pointer-events: none;
		transition: opacity var(--clip-fade, 0.15s) ease;
	}
</style>
