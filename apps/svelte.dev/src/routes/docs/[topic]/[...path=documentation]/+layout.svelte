<script>
	import { DocsContents } from '@sveltejs/site-kit/docs';

	let { data, children } = $props();
</script>

<div class="container">
	<div class="toc-container" style="order: 1">
		<DocsContents contents={data.sections} />
	</div>

	<div class="page content">
		{@render children()}
	</div>
</div>

<style>
	.container {
		--sidebar-menu-width: 28rem;
		--sidebar-width: var(--sidebar-menu-width);

		display: flex;
		flex-direction: column;
	}

	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);

		min-width: 0 !important;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.toc-container {
		background: var(--sk-bg-2);
		display: none;
		:root:not(.light) & {
			@media (prefers-color-scheme: dark) {
				background: var(--sk-bg-0);
			}
		}

		:root.dark & {
			background: var(--sk-bg-0);
		}
	}

	@media (min-width: 832px) {
		.toc-container {
			display: block;
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-height));
			position: fixed;
			left: 0;
			top: var(--sk-nav-height);
			overflow: hidden;

			&::after {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				width: 3px;
				height: 100%;
				background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.03));
			}
		}

		.page {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(
				28rem,
				calc(
					0.5 *
						(
							100vw - var(--sk-page-content-width) - var(--sk-page-padding-side) -
								var(--sk-page-padding-side)
						)
				)
			);
			flex-direction: row;
		}

		.page {
			--on-this-page-display: block;
			padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
			margin: 0 auto;
			box-sizing: content-box;
			width: 100%;
		}
	}
</style>
