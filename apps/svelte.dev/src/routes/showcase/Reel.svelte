<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';
	import { prefersReducedMotion } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import type { Site } from './sites.ts';

	interface Props {
		reels: Array<{ site: Site; clip: string; still: Picture }>;
		/** whether clips play, which the button at the start of the page turns off */
		autoplay: boolean;
	}

	let { reels, autoplay }: Props = $props();

	let current = $state(0);
	let progress = $state(0);

	/** the one showing and the one after it, so it is loaded by the time it comes on */
	const near = (i: number) => i === current || i === (current + 1) % reels.length;

	/** plays the one showing from its start while clips play, and stops the rest */
	function playback(i: number) {
		return (video: HTMLVideoElement) => {
			if (i === current && autoplay && !prefersReducedMotion.current) {
				video.play().catch(() => {});
			} else {
				video.pause();
				if (i !== current) video.currentTime = 0;
			}
		};
	}

	/** the name of the next one, in halfway through the change to it, rising a little */
	function arrive(node: Element) {
		const rise = prefersReducedMotion.current ? 0 : 0.4;
		return {
			delay: 150,
			duration: 300,
			easing: quintOut,
			css: (t: number, u: number) => `opacity: ${t}; translate: 0 ${u * rise}rem`
		};
	}

	/** and the name of the one before, out of its way */
	function leave(node: Element) {
		return { duration: 150, css: (t: number) => `opacity: ${t}` };
	}

	function go(i: number) {
		current = (i + reels.length) % reels.length;
		progress = 0;
	}
</script>

<section class="reel" aria-roledescription="carousel" aria-label="Sites built with Svelte">
	<div class="stage">
		{#each reels as { site, clip, still }, i (site.id)}
			<a
				class={['frame', { current: i === current }]}
				href="#{site.id}"
				aria-hidden={i !== current}
				tabindex={i === current ? 0 : -1}
			>
				<video
					{@attach playback(i)}
					src={near(i) ? clip : undefined}
					poster={still.img.src}
					muted
					playsinline
					preload={near(i) ? 'auto' : 'none'}
					ontimeupdate={(event) => {
						if (i !== current) return;
						const video = event.currentTarget;
						progress = video.duration ? video.currentTime / video.duration : 0;
					}}
					onended={() => i === current && go(current + 1)}
				></video>
				<span class="visually-hidden">{site.name}</span>
			</a>
		{/each}

		<!-- the one hue over all of it -->
		<span class="tint" aria-hidden="true"></span>

		<div class="haze" aria-hidden="true">
			<span style="--blur: 4px; --from: 6%; --to: 86%"></span>
			<span style="--blur: 12px; --from: 16%; --to: 72%"></span>
			<span style="--blur: 32px; --from: 26%; --to: 62%"></span>
			<!-- and building up towards the foot, behind the name and the marks -->
			<span style="--blur: 4px; --from: 76%; --to: 124%"></span>
			<span style="--blur: 12px; --from: 86%; --to: 124%"></span>
		</div>
	</div>

	<div class="caption">
		<p class="now" aria-live="polite">
			{#key current}
				<span class="line" in:arrive out:leave>
					<a class="name" href="#{reels[current].site.id}">{reels[current].site.name}</a>
				</span>
			{/key}
		</p>

		<ol class="steps">
			{#each reels as { site }, i (site.id)}
				<li>
					<button
						class="step"
						aria-label={site.name}
						aria-current={i === current}
						style:--progress={i < current ? 1 : i === current ? progress : 0}
						onclick={() => go(i)}
					></button>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	/* behind the heading, across the whole of the hero, in the cool greys of the light around the
	   machine on the home page rather than their own colours, from its shadow to its highlight, so
	   the hero is part of the site rather than a dark screen in it, and the heading reads in its own
	   ink over any of them */
	.reel {
		--shadow: hsl(205, 12%, 72%);
		--highlight: rgb(235, 243, 249);
		--tint: hsl(205, 22%, 80%);
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	/* the page's own colour coming in over the foot of the hero and the clips running on below it,
	   so they lose their contrast as they fade, rather than words in them showing under the page */
	.reel::after {
		content: '';
		position: absolute;
		inset: auto 0 calc(-1 * var(--tail, 0px));
		z-index: 1;
		height: calc(var(--tail, 0px) + 8rem);
		background: linear-gradient(
			in oklab,
			transparent,
			color-mix(in srgb, var(--sk-bg-1) 80%, transparent) 55%,
			var(--sk-bg-1)
		);
		pointer-events: none;
	}

	:global(:root.dark) .reel {
		--shadow: hsl(209, 12%, 11%);
		--highlight: hsl(209, 10%, 42%);
		--tint: hsl(209, 12%, 30%);
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not(.light)) .reel {
			--shadow: hsl(209, 12%, 11%);
			--highlight: hsl(209, 10%, 42%);
			--tint: hsl(209, 12%, 30%);
		}
	}

	/* each site in turn, dimmed a little so it reads as the background of this page rather than the
	   site itself, running on past the foot of the hero by the length of its tail */
	.stage {
		position: absolute;
		inset: 0 0 calc(-1 * var(--tail, 0px));
		overflow: hidden;
		container-type: size;
		/* nothing in it drawn outside it, so scrolling past redraws only what shows */
		contain: strict;

		/* the clips, already in greys, from the shadow up, by a layer of it that only lightens what
		   is darker, and to the highlight down, by one of it multiplied in, blended rather than
		   filtered, as safari leaves a filter off a video while it plays */
		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: 1;
			pointer-events: none;
		}

		&::before {
			background: var(--shadow);
			mix-blend-mode: lighten;
		}

		&::after {
			background: var(--highlight);
			mix-blend-mode: multiply;
		}
	}

	/* and in the hue of the light alone, keeping only how light each part is, as a little of the
	   clips' own colour comes through the grey */
	.tint {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: var(--tint);
		mix-blend-mode: color;
		pointer-events: none;
	}

	/* the clips fading out into the page over the tail, eased so the fade has no start or end you can
	   see, rather than in a straight line that stops at an edge. on the clips and the wash over them
	   rather than the whole of the stage, since safari leaves out the blur over anything inside
	   something masked */
	.frame,
	.stage::before,
	.stage::after,
	.tint {
		--from: calc(100% - var(--tail, 0px));
		--length: var(--tail, 0px);
		mask-image: linear-gradient(
			rgb(0 0 0 / 1) calc(var(--from) + var(--length) * 0),
			rgb(0 0 0 / 0.987) calc(var(--from) + var(--length) * 0.081),
			rgb(0 0 0 / 0.951) calc(var(--from) + var(--length) * 0.146),
			rgb(0 0 0 / 0.896) calc(var(--from) + var(--length) * 0.196),
			rgb(0 0 0 / 0.825) calc(var(--from) + var(--length) * 0.236),
			rgb(0 0 0 / 0.741) calc(var(--from) + var(--length) * 0.271),
			rgb(0 0 0 / 0.648) calc(var(--from) + var(--length) * 0.304),
			rgb(0 0 0 / 0.55) calc(var(--from) + var(--length) * 0.338),
			rgb(0 0 0 / 0.45) calc(var(--from) + var(--length) * 0.375),
			rgb(0 0 0 / 0.352) calc(var(--from) + var(--length) * 0.419),
			rgb(0 0 0 / 0.259) calc(var(--from) + var(--length) * 0.472),
			rgb(0 0 0 / 0.175) calc(var(--from) + var(--length) * 0.539),
			rgb(0 0 0 / 0.104) calc(var(--from) + var(--length) * 0.62),
			rgb(0 0 0 / 0.049) calc(var(--from) + var(--length) * 0.716),
			rgb(0 0 0 / 0.013) calc(var(--from) + var(--length) * 0.833),
			rgb(0 0 0 / 0) calc(var(--from) + var(--length) * 1)
		);
	}

	/* blurred in a band across the whole width behind the heading, building up gradually from
	   above and below it in a few layers of more blur over a narrower band each, few enough to scroll smoothly, so there is no edge where
	   it starts and the sites' own words behind the heading are out of the way */
	.haze {
		position: absolute;
		/* over the hero, so it is still behind the caption */
		inset: 0 0 var(--tail, 0px);
		z-index: 2;
		pointer-events: none;

		/* only one layer on phones and tablets, which may struggle to redraw so many over a video
		   every frame, over the whole of it, rather than a filter on the video, which safari leaves
		   out while it plays */
		@media (hover: none), (max-width: 1023px) {
			span:not(:first-child) {
				display: none;
			}

			span:first-child {
				/* on over any of the clips below the hero, where it runs on past it */
				bottom: calc(-1 * var(--tail, 0px));
				-webkit-backdrop-filter: blur(0.5rem);
				backdrop-filter: blur(0.5rem);
				mask-image: none;
			}
		}

		span {
			position: absolute;
			inset: 0;
			-webkit-backdrop-filter: blur(var(--blur));
			backdrop-filter: blur(var(--blur));
			mask-image: linear-gradient(
				transparent var(--from),
				black calc(var(--from) + 12%),
				black calc(var(--to) - 12%),
				transparent var(--to)
			);
		}

		/* and that at its foot running on over the tail, so the clips are not sharp again where it
		   would end */
		span:nth-child(n + 4) {
			bottom: calc(-1 * var(--tail, 0px));
			mask-image:
				linear-gradient(transparent var(--from), black calc(var(--from) + 12%)),
				linear-gradient(black, black);
			mask-size:
				100% calc(100% - var(--tail, 0px)),
				100% var(--tail, 0px);
			mask-position: top, bottom;
			mask-repeat: no-repeat;
		}
	}

	.frame {
		position: absolute;
		inset: 0;
		/* dark around the clip where it is fitted rather than cropped, as on phones */
		background: hsl(0, 0%, 10%);
		opacity: 0;
		visibility: hidden;
		/* blurred a little on the way out, so the two read as one changing into the other rather
		   than two pictures over each other */
		filter: blur(2px);
		transition:
			opacity 0.6s cubic-bezier(0.645, 0.045, 0.355, 1),
			filter 0.6s cubic-bezier(0.645, 0.045, 0.355, 1),
			visibility 0s 0.6s;

		&.current {
			opacity: 1;
			visibility: visible;
			filter: none;
			transition: opacity 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);
		}

		/* in greys, by a layer of no colour blended over the clip */
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: grey;
			mix-blend-mode: saturation;
			pointer-events: none;
		}

		video {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: top;

			/* where the hero is taller than it is wide, as on phones, the whole of it fitted across
			   the width rather than cropped at the sides to cover the height, in the middle, its top
			   and foot fading into the page */
			@container (max-aspect-ratio: 1 / 1) {
				position: absolute;
				top: 50%;
				left: 0;
				width: 100%;
				height: auto;
				translate: 0 -50%;
				mask-image: linear-gradient(transparent, black 15%, black 85%, transparent);
			}

			/* larger on phones, cropped a little at the sides, so it is not lost in the space around it */
			@media (max-width: 739px) {
				left: -40%;
				width: 180%;
			}
		}
	}

	/* the site showing and the marks for each, along the foot of the hero */
	.caption {
		position: absolute;
		inset: auto 0 0;
		z-index: 2;
		/* on the left, clear of the button that pauses videos in the corner, which on phones is below
		   the hero, as it is shorter than the screen */
		display: grid;
		justify-items: start;
		gap: 0.4rem;
		/* in line with the heading, which is in line with the page */
		padding: 4.8rem
			max(var(--sk-page-padding-side), calc((100% - 140rem) / 2 + var(--sk-page-padding-side)))
			1.6rem;
		--sk-border: color-mix(in srgb, var(--sk-fg-1) 25%, transparent);
	}

	/* the one going and the one coming in the same place, as they change over */
	.now {
		display: grid;
		margin: 0;
	}

	.line {
		grid-area: 1 / 1;
	}

	.name {
		font: 400 clamp(2rem, 1.6rem + 0.8vw, 2.8rem) / 1.1 var(--sk-font-family-heading);
		color: var(--sk-fg-1);
		text-decoration-line: underline;
		text-underline-offset: 0.2em;
		text-decoration-color: transparent;

		&:hover {
			text-decoration-color: currentColor;
		}
	}

	/* one mark for each, filling as the one showing plays, like the pages of a story */
	.steps {
		display: flex;
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.step {
		position: relative;
		display: block;
		width: 1.6rem;
		/* taller than it looks, so it is easier to tap, without taking up more room */
		height: 4.4rem;
		margin-block: -1rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;

		&::before,
		&::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			top: calc(50% - 0.1rem);
			height: 0.2rem;
			background: var(--sk-border);
		}

		/* in the orange of svelte, the one colour in the hero */
		&::after {
			background: var(--sk-fg-accent);
			transform-origin: left;
			scale: var(--progress) 1;
			/* between the few times a second the time it has played is known, so it fills evenly */
			transition: scale 0.25s linear;
		}

		&:focus-visible {
			outline: 2px solid var(--sk-fg-accent);
			outline-offset: 2px;
		}
	}

	@media (max-width: 739px) {
		.steps {
			flex-wrap: wrap;
		}

		.step {
			width: 1.2rem;
		}
	}
</style>
