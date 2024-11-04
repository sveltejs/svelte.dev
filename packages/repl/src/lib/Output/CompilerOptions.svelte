<script lang="ts">
	import type { Workspace } from 'editor';
	import { Checkbox } from '@sveltejs/site-kit/components';

	let { workspace }: { workspace: Workspace } = $props();
</script>

<div class="options">
	result = svelte.compile(source, &#123;
	<div class="option">
		<span class="key">generate:</span>

		{#each ['client', 'server'] as const as generate}
			<input
				id={generate}
				type="radio"
				checked={workspace.compiler_options.generate === generate}
				value={generate}
				onchange={() => {
					workspace.update_compiler_options({ generate });
				}}
			/>
			<label for={generate}><span class="string">"{generate}"</span></label>
		{/each},
	</div>

	<!-- svelte-ignore a11y_label_has_associated_control (TODO this warning should probably be disabled if there's a component)-->
	<label class="option">
		<span class="key">dev:</span>
		<span style="font-size: 1.2rem">
			<Checkbox
				checked={workspace.compiler_options.dev!}
				onchange={(dev) => {
					workspace.update_compiler_options({ dev });
				}}
			/>
		</span>
		<span class="boolean">{workspace.compiler_options.dev}</span>
	</label>
	});
</div>

<style>
	.options {
		padding: 0 1rem;
		font: var(--sk-font-mono);
	}

	.option {
		display: block;
		padding: 0 0 0 1.25em;
		white-space: nowrap;
		user-select: none;
	}

	.key {
		display: inline-block;
		width: 6em;
	}

	.string {
		color: var(--shiki-token-string);
	}

	label {
		display: inline-block;
	}

	label[for] {
		color: var(--shiki-token-string);
	}

	label :global(input[type='checkbox']) {
		top: -1px;
	}

	input[type='radio'] {
		position: absolute;
		top: auto;
		overflow: hidden;
		clip: rect(1px, 1px, 1px, 1px);
		width: 1px;
		height: 1px;
		white-space: nowrap;
	}

	input[type='radio'] + label {
		padding: 0 0 0 1.6em;
		margin: 0 0.6em 0 0;
		opacity: 0.7;
	}

	input[type='radio']:checked + label {
		opacity: 1;
	}

	input[type='radio'] + label:before {
		content: '';
		display: block;
		box-sizing: border-box;
		float: left;
		width: 1.6rem;
		height: 1.6rem;
		margin-left: -21px;
		margin-top: 4px;
		/* vertical-align: top; */
		cursor: pointer;
		text-align: center;
		transition: box-shadow 0.05s ease-out;
		background-color: var(--sk-fg-4);
		border-radius: 100%;
		box-shadow: inset 0 0 0 0.5em var(--sk-bg-2);
		border: 1px solid var(--sk-border);
	}

	input[type='radio']:checked + label:before {
		background-color: var(--sk-fg-accent);
		box-shadow: inset 0 0 0 0.15em var(--sk-bg-2);
		border: 1px solid var(--sk-fg-accent);
		transition: box-shadow 0.2s ease-out;
	}
</style>
