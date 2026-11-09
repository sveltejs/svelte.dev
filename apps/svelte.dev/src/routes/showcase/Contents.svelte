<!--@component
the categories like the contents of a magazine, each with the screenshot of its first site, which
moves to it in the list as you jump there
-->
<script lang="ts">
	import { fade_in } from './fade-in.ts';
	import { placeholders } from './media.ts';
	import { morph, prime } from './morph.ts';
	import Screenshot from './Screenshot.svelte';
	import type { Site } from './sites.ts';

	interface Props {
		sections: Array<{ id: string; title: string; lead?: Site }>;
	}

	let { sections }: Props = $props();
</script>

<nav class="categories" aria-label="Categories">
	<ul>
		{#each sections as section (section.id)}
			<li>
				<a
					href="#{section.id}"
					onclick={(event) => section.lead && morph(event, section.lead.id)}
					onpointerenter={() => section.lead && prime(section.lead.id)}
					onfocus={() => section.lead && prime(section.lead.id)}
					{@attach fade_in}
				>
					<span class="title">{section.title}</span>

					{#if section.lead}
						<span
							class="sheet"
							aria-hidden="true"
							style:--position={section.lead.screenshot?.position}
							style:--placeholder={placeholders[section.lead.id]}
						>
							<Screenshot id={section.lead.id} sizes="(min-width: 1024px) 200px, 120px" />
						</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* as wide as the sites below so their edges line up */
	.categories {
		max-width: 140rem;
		margin: 0 auto;
		padding: 5.6rem var(--sk-page-padding-side) 0;

		@media (min-width: 1024px) {
			padding-top: 8rem;
		}

		ul {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			/* the same as between the sites, so the second column starts where theirs does */
			column-gap: 2.4rem;

			@media (min-width: 1280px) {
				column-gap: 3.2rem;
			}

			margin: 0;
			padding: 0;
			list-style: none;
			border-top: 1px solid var(--sk-border);

			@media (min-width: 740px) {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
		}

		li {
			border-bottom: 1px solid var(--sk-border);
		}

		a {
			display: grid;
			/* the screenshot first, so the column's ragged text, not a screenshot, meets the gap
			   between the columns, which is narrower than the one beside each screenshot would
			   otherwise look */
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-areas: 'sheet title';
			align-items: center;
			column-gap: 2.4rem;
			height: 100%;
			padding: 1.6rem 0;

			@media (min-width: 740px) {
				padding: 2.4rem 0;
			}

			color: var(--sk-fg-1);
			text-decoration: none;

			/* underlined on hover like links elsewhere on the site, the name only */
			&:hover {
				text-decoration: none;

				.title {
					text-decoration: underline;
				}
			}
		}
	}

	.title {
		grid-area: title;
		font: 400 clamp(2.4rem, 2rem + 0.8vw, 3.2rem) / 1.1 var(--sk-font-family-heading);
	}

	.sheet {
		position: relative;
		display: block;
		grid-area: sheet;
		width: 8rem;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border: 1px solid var(--sk-border);
		/* the tiny screenshot, scaled up and so blurred, until the screenshot fades in over it */
		background: var(--placeholder, none) var(--position, left top) / cover no-repeat var(--sk-bg-3);

		@media (min-width: 740px) {
			width: 12rem;
		}

		@media (min-width: 1024px) {
			width: 16rem;
		}
	}

	/* greyed towards the top and bottom of the window like the list, each by a layer of grey of its
	   own rather than one over the list, which is over the foot of the hero, so the page there stays
	   clear. in colour wherever it is while pointed at or focused */
	@supports (animation-timeline: view()) {
		.sheet {
			isolation: isolate;
			view-timeline: --sheet;

			&::after {
				content: '';
				position: absolute;
				inset: -100vh 0 0;
				background: var(--band);
				mix-blend-mode: saturation;
				pointer-events: none;
				animation: stay-in-window linear both;
				animation-timeline: --sheet;
			}

			a:is(:hover, :focus-visible) &::after {
				display: none;
			}
		}
	}

	@keyframes stay-in-window {
		to {
			translate: 0 100%;
		}
	}
</style>
