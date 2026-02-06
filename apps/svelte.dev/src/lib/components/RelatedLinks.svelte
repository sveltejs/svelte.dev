<script lang="ts">
	interface Props {
		links: Array<{ path: string; breadcrumbs: string[] }>;
	}

	let { links }: Props = $props();
</script>

<div class="related-links">
	<h2>See also</h2>

	<ul>
		{#each links as link}
			<li>
				<a href={link.path}>
					{#each link.breadcrumbs as breadcrumb}
						<span>{breadcrumb}</span>
					{/each}
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	div {
		background: var(--sk-bg-2);
		padding: 1rem;
		margin: 2rem 0;
		overflow: hidden;
	}

	h2 {
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-1);
		text-transform: uppercase;
	}

	ul {
		list-style: none;
		font: var(--sk-font-ui-small);
	}

	a {
		text-decoration: none;
		color: var(--sk-fg-4);
		white-space: pre;
		display: block;
		overflow: hidden;
		width: 100%;
		text-overflow: ellipsis;

		&:hover {
			text-decoration: underline;
		}

		span:last-child {
			color: var(--sk-fg-accent);

			a:hover & {
				text-decoration: underline;
			}
		}

		span:not(:last-child) {
			text-transform: uppercase;

			&::after {
				content: ' • ';
			}
		}
	}
</style>
