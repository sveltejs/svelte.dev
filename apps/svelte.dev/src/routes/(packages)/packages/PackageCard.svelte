<script lang="ts">
	import type { Package } from '$lib/server/content';

	type Props = {
		pkg: Package;
	};

	let { pkg }: Props = $props();

	/**
	 * Formats a number with K, M, B, T suffixes
	 *
	 * @param num - The number to format
	 * @returns Formatted string representation of the number
	 *
	 * Examples:
	 * 437 -> 437
	 * 4370 -> 4.3K
	 * 43700 -> 43K
	 * 437000 -> 437K
	 * 4370000 -> 4.3M
	 * 43700000 -> 43M
	 * 437000000 -> 437M
	 */
	function format_number(num: number): string {
		// Define thresholds and suffixes
		const thresholds = [
			{ value: 1e12, suffix: 'T' },
			{ value: 1e9, suffix: 'B' },
			{ value: 1e6, suffix: 'M' },
			{ value: 1e3, suffix: 'K' }
		];

		// Handle zero and negative numbers
		if (num === 0) return '0';

		const is_negative = num < 0;
		const abs_num = Math.abs(num);

		// Find the appropriate threshold
		for (const { value, suffix } of thresholds) {
			if (abs_num >= value) {
				// Calculate the divided value
				const divided = abs_num / value;

				// Format with one decimal place if the first digit is less than 10
				const formatted =
					divided < 10
						? (Math.round(divided * 10) / 10).toFixed(1).replace(/\.0$/, '')
						: Math.round(divided);

				// Return with proper sign and suffix
				return `${is_negative ? '-' : ''}${formatted}${suffix}`;
			}
		}

		// If no threshold is met, return the number as is
		return `${is_negative ? '-' : ''}${Math.round(abs_num)}`;
	}
</script>

<article data-pubdate={pkg.updated}>
	<span class="header">
		<h3 class={[(pkg.outdated || pkg.deprecated) && 'faded']}>
			{pkg.name}
		</h3>
		<span class={['status']}>
			{#if pkg.ts_support}
				<span class="no-pill" style="translate: 0 2px;">
					{#if pkg.ts_support === 'first-party'}
						<svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24"
							><!-- Icon from Simple Icons by Simple Icons Collaborators - https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md --><path
								fill="currentColor"
								d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75q.918 0 1.627.111a6.4 6.4 0 0 1 1.306.34v2.458a4 4 0 0 0-.643-.361a5 5 0 0 0-.717-.26a5.5 5.5 0 0 0-1.426-.2q-.45 0-.819.086a2.1 2.1 0 0 0-.623.242q-.254.156-.393.374a.9.9 0 0 0-.14.49q0 .294.156.529q.156.234.443.444c.287.21.423.276.696.41q.41.203.926.416q.705.296 1.266.628q.561.333.963.753q.402.418.614.957q.213.538.214 1.253q0 .986-.373 1.656a3 3 0 0 1-1.012 1.085a4.4 4.4 0 0 1-1.487.596q-.85.18-1.79.18a10 10 0 0 1-1.84-.164a5.5 5.5 0 0 1-1.512-.493v-2.63a5.03 5.03 0 0 0 3.237 1.2q.5 0 .872-.09q.373-.09.623-.25q.249-.162.373-.38a1.02 1.02 0 0 0-.074-1.089a2.1 2.1 0 0 0-.537-.5a5.6 5.6 0 0 0-.807-.444a28 28 0 0 0-1.007-.436q-1.377-.575-2.053-1.405t-.676-2.005q0-.92.369-1.582q.368-.662 1.004-1.089a4.5 4.5 0 0 1 1.47-.629a7.5 7.5 0 0 1 1.77-.201m-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
							/></svg
						>
					{:else if pkg.ts_support === '@types'}
						<svg
							version="1.1"
							xmlns="http://www.w3.org/2000/svg"
							x="0px"
							y="0px"
							viewBox="0 0 256 256"
							xml:space="preserve"
							width="1.3em"
							height="1.3em"
						>
							<rect class="st0" width="256" height="256" style="fill: currentColor;" />
							<rect x="6" y="6" class="st1" width="244" height="244" style="fill: currentColor;" />
							<path
								class="st0"
								d="M41.8,111.5c8.6-1.6,19.9-2.5,31.8-2.5c19.7,0,32.6,4.2,42.6,13c10.8,9.4,17.6,24.5,17.6,46
	c0,23.4-7.3,39.5-17.3,49.5c-11,10.7-27.6,15.8-48,15.8c-12.2,0-20.8-0.9-26.7-1.8V111.5z M65.4,211.2c2,0.5,5.2,0.5,8.2,0.5
	c21.3,0.2,35.2-13.6,35.2-42.7c0.2-25.4-12.5-38.8-32.7-38.8c-5.2,0-8.6,0.5-10.6,1.1V211.2z"
							/>
							<path class="st0" d="M169.4,134.7h-32.2v-22.8h92.3v22.8h-32.8V232h-27.3V134.7z" />
						</svg>
					{/if}
				</span>
			{/if}

			<span style="flex: 1 1 auto" class="no-pill"></span>

			{#if pkg.outdated}
				<span>outdated</span>
			{/if}
			{#if pkg.deprecated}
				<span>deprecated</span>
			{/if}
			{#if pkg.official}
				<span class={[pkg.official && 'official']}>official</span>
			{/if}
		</span>
	</span>

	<p class="description">{pkg.description}</p>

	<p class="stats">
		{#if pkg.github_stars}
			<span title="{pkg.github_stars} Github Stars">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
					><!-- Icon from All by undefined - undefined --><path
						fill="currentColor"
						d="M9.6 15.65L12 13.8l2.4 1.85l-.9-3.05l2.25-1.6h-2.8L12 7.9l-.95 3.1h-2.8l2.25 1.6zm2.4.65l-3.7 2.825q-.275.225-.6.213t-.575-.188t-.387-.475t-.013-.65L8.15 13.4l-3.625-2.575q-.3-.2-.375-.525t.025-.6t.35-.488t.6-.212H9.6l1.45-4.8q.125-.35.388-.538T12 3.475t.563.188t.387.537L14.4 9h4.475q.35 0 .6.213t.35.487t.025.6t-.375.525L15.85 13.4l1.425 4.625q.125.35-.012.65t-.388.475t-.575.188t-.6-.213zm0-4.525"
					/></svg
				>{format_number(pkg.github_stars)}
			</span>
		{/if}

		{#if pkg.downloads}
			<span title="{pkg.downloads} downloads">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
					><!-- Icon from All by undefined - undefined --><path
						fill="currentColor"
						d="M12.554 16.506a.75.75 0 0 1-1.107 0l-4-4.375a.75.75 0 0 1 1.107-1.012l2.696 2.95V3a.75.75 0 0 1 1.5 0v11.068l2.697-2.95a.75.75 0 1 1 1.107 1.013z"
					/><path
						fill="currentColor"
						d="M3.75 15a.75.75 0 0 0-1.5 0v.055c0 1.367 0 2.47.117 3.337c.12.9.38 1.658.981 2.26c.602.602 1.36.86 2.26.982c.867.116 1.97.116 3.337.116h6.11c1.367 0 2.47 0 3.337-.116c.9-.122 1.658-.38 2.26-.982s.86-1.36.982-2.26c.116-.867.116-1.97.116-3.337V15a.75.75 0 0 0-1.5 0c0 1.435-.002 2.436-.103 3.192c-.099.734-.28 1.122-.556 1.399c-.277.277-.665.457-1.4.556c-.755.101-1.756.103-3.191.103H9c-1.435 0-2.437-.002-3.192-.103c-.734-.099-1.122-.28-1.399-.556c-.277-.277-.457-.665-.556-1.4c-.101-.755-.103-1.756-.103-3.191"
					/></svg
				>
				{format_number(+pkg.downloads)}
			</span>
		{/if}

		{#if pkg.dependents}
			<span title="{pkg.dependents} dependents">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="1.5em"
					width="1.5em"
					viewBox="0 0 512 512"
					style="translate: 0 2px;"
				>
					<!-- Top cube - slightly larger -->
					<path
						d="M256 100 L346 150 L256 200 L166 150 Z"
						fill="none"
						stroke="currentColor"
						stroke-width="20"
					/>

					<!-- Connection lines - slightly curved for better visual flow -->
					<path d="M226 180 Q206 210 176 230" fill="none" stroke="currentColor" stroke-width="20" />
					<path d="M286 180 Q306 210 336 230" fill="none" stroke="currentColor" stroke-width="20" />

					<!-- Bottom left cube - positioned for better balance -->
					<path
						d="M176 230 L246 280 L176 330 L106 280 Z"
						fill="none"
						stroke="currentColor"
						stroke-width="20"
					/>

					<!-- Bottom right cube - positioned for better balance -->
					<path
						d="M336 230 L406 280 L336 330 L266 280 Z"
						fill="none"
						stroke="currentColor"
						stroke-width="20"
					/>
				</svg>
				{format_number(+pkg.dependents)}</span
			>
		{/if}

		<span style="flex: 1 1 auto"></span>

		<span style="display: flex; gap: 0.75rem">
			<a
				href="https://npmjs.org/package/{pkg.name}"
				target="_blank"
				rel="noreferrer"
				aria-label="View on npm"
				onclick={(e) => e.stopPropagation()}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"
					><path d="M3 3v18h18V3H3m3 3h12v12h-3V9h-3v9H6V6z" fill="currentColor" /></svg
				></a
			>

			{#if pkg.repo_url}
				<a
					href={pkg.repo_url}
					target="_blank"
					rel="noreferrer"
					aria-label="View on GitHub"
					onclick={(e) => e.stopPropagation()}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
						/></svg
					>
				</a>
			{/if}

			{#if pkg.homepage}
				<a
					href={pkg.homepage}
					target="_blank"
					rel="noreferrer"
					aria-label="View on GitHub"
					onclick={(e) => e.stopPropagation()}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"
						><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><g
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							><circle cx="12" cy="12" r="10" /><path
								d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20M2 12h20"
							/></g
						></svg
					>
				</a>
			{/if}
		</span>
	</p>
</article>

<style>
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	h3 {
		display: inline-block;
		font: var(--sk-font-ui-medium);

		/* flex: 1 1 auto; */

		&.faded {
			color: var(--sk-fg-3);
		}
	}

	article {
		display: grid;
		grid-template-rows: auto 1fr auto;
		box-sizing: border-box;

		height: 100%;
		min-height: 0;

		background-color: var(--sk-bg-2);

		border: 1px solid var(--sk-bg-4);
		border-radius: var(--sk-border-radius);
		padding: 1rem;

		min-height: 16em;

		&:hover {
			filter: drop-shadow(0.2rem, 0.4rem, 1rem rgb(0 0 0 / 0.1));
		}

		a {
			display: block;
			text-decoration: none;
			color: inherit;
		}

		.status {
			flex: 1 1 auto;

			display: flex;
			align-items: center;
			gap: 0.5rem;

			margin-left: 0.5rem;

			> *:not(.no-pill) {
				font: var(--sk-font-ui-small);
				border-radius: 9999px;
				padding: 0.2rem 1rem;
				width: fit-content;
				border: 1px solid var(--sk-border);
			}

			.official {
				border-color: var(--sk-fg-accent);
				color: var(--sk-fg-accent);
				background-color: color-mix(in hsl, var(--sk-fg-accent), transparent 95%);
			}
		}

		.stats {
			display: flex;
			gap: 1.6rem;
			font: var(--sk-font-ui-small);

			a {
				display: flex;
			}

			span {
				display: flex;
				gap: 0.1rem;
				align-items: center;
			}
		}

		.description {
			font: var(--sk-font-ui-small);
			color: var(--sk-fg-3);
			margin: 0 0 0.5em 0;
			flex: 1;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			line-clamp: 2;
			overflow: hidden;
			text-overflow: ellipsis;
			max-height: 2lh;
			/* max-width: calc(100% - var(--sidebar-width)); */
		}
	}
</style>
