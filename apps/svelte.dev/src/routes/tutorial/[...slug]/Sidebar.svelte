<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { Text } from '@sveltejs/site-kit/components';
	import PageControls from '$lib/components/PageControls.svelte';

	/** @type {import('$lib/tutorial').Exercise} */
	export let exercise;

	/** @type {HTMLElement} */
	export let sidebar;

	const dispatch = createEventDispatcher();

	const namespace = 'svelte.dev/tutorial';
	const copy_enabled = `${namespace}:copy_enabled`;

	let show_modal = false;
</script>

<section bind:this={sidebar}>
	<div
		class="text"
		on:copy={(e) => {
			if (sessionStorage[copy_enabled]) return;

			/** @type {HTMLElement | null} */
			let node = /** @type {HTMLElement} */ (e.target);

			while (node && node !== e.currentTarget) {
				if (node.nodeName === 'PRE') {
					show_modal = true;

					e.preventDefault();
					return;
				}

				node = /** @type {HTMLElement | null} */ (node.parentNode);
			}
		}}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={(e) => {
				const node = /** @type {HTMLElement} */ (e.target);

				if (node.nodeName === 'CODE') {
					const { file } = node.dataset;

					if (file) {
						dispatch('select', { file });
					}
				}

				if (node.nodeName === 'SPAN' && node.classList.contains('filename')) {
					const ext = node.dataset.ext || '';
					const file = exercise.scope.prefix + node.textContent + ext;

					dispatch('select', { file });
				}
			}}
		>
			<Text>
				{@html exercise.html}
			</Text>
		</div>

		<PageControls
			repo="https://github.com/sveltejs/svelte.dev/edit/main/apps/svelte.dev/content/{exercise.dir}"
			prev={exercise.prev && {
				title: exercise.prev.title,
				path: `/tutorial/${exercise.prev.slug}`
			}}
			next={exercise.next && {
				title: exercise.next.title,
				path: `/tutorial/${exercise.next.slug}`
			}}
		/>
	</div>
</section>

{#if show_modal}
	<Modal on:close={() => (show_modal = false)}>
		<div class="modal-contents">
			<h2>Copy and paste is currently disabled!</h2>

			<p>
				We recommend typing the code into the editor to complete the exercise, as this results in
				better retention and understanding.
			</p>
			<label>
				<input
					type="checkbox"
					on:change={(e) => {
						sessionStorage[copy_enabled] = e.currentTarget.checked ? 'true' : '';
					}}
				/>
				enable copy-and-paste for the duration of this session
			</label>

			<button on:click={() => (show_modal = false)}>OK</button>
		</div>
	</Modal>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;

		overflow-y: auto;
	}

	.text {
		flex: 1 1 auto;
		padding: 2.2rem var(--sk-page-padding-side);
		background: var(--sk-back-1);

		:global {
			[data-file],
			.filename {
				cursor: pointer;
				background-image: url($lib/icons/file.svg);
				background-repeat: no-repeat;

				:root.dark & {
					background-image: url($lib/icons/file-dark.svg);
				}
			}

			[data-file] {
				background-position: 0.5rem 50%;
				background-size: 1rem 1rem;
				padding-left: 2rem;
			}

			.filename {
				background-position: 0 54%;
				background-size: 1rem 1rem;
				padding-left: 1.5rem !important;
			}

			.desktop {
				display: none;
			}
		}
	}

	.modal-contents {
		h2 {
			font: var(--sk-font-ui-large);
			margin: 0 0 0.5em 0;
		}

		p {
			font: var(--sk-font-ui-medium);
		}

		label {
			user-select: none;
			font: var(--sk-font-ui-medium);
		}

		button {
			display: block;
			background-color: var(--sk-theme-1);
			color: white;
			padding: 1rem;
			width: 10em;
			margin: 1em 0 0 0;
			border-radius: var(--sk-border-radius);
			line-height: 1;
			font: var(--sk-font-ui-small);
		}
	}

	@media (max-width: 799px) {
		.text {
			border-right: none;
		}
	}

	@media (min-width: 800px) {
		.text :global(.mobile) {
			display: none;
		}

		.text :global(.desktop) {
			display: inline;
		}
	}
</style>
