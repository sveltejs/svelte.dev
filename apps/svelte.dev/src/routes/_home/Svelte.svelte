<p class="definition">
	<em>/ˈsvɛlt/</em>
	<span class="description">
		<span class="adjective"></span> attractively thin, graceful and stylish
	</span>
</p>

<style>
	.definition {
		position: relative;
		display: flex;
		/* align-items: baseline; */
		align-items: start;
		justify-content: center;
		max-width: 120rem;
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
		gap: 1rem;

		em {
			font-style: normal;
			font-size: var(--sk-font-size-h1);
			color: var(--sk-theme-1);
			text-wrap: nowrap;
			line-height: 1;
		}

		.description {
			position: relative;
			font: var(--sk-font-ui-medium);
			/* display: flex;
			flex-direction: column; */
			/* align-items: center; */
			bottom: 0.2em;
			text-wrap: balance;
			width: 16rem;
		}

		.adjective {
			position: relative;
			padding: 0.25em 0.5em 0.1em;
			line-height: 1;
			text-transform: uppercase;
			background: var(--sk-text-2);
			border-radius: var(--sk-border-radius);
			font: var(--sk-font-ui-small);
			color: var(--sk-back-2);

			&::after {
				content: 'adj.';
			}
		}

		@media (min-width: 800px) {
			align-items: baseline;
			justify-content: start;

			.description {
				flex-direction: row;
				gap: 1rem;
				width: auto;
			}

			.adjective::after {
				content: 'adjective';
			}
		}
	}
</style>
