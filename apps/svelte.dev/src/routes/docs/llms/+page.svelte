<script>
	import { Text } from '@sveltejs/site-kit/components';
</script>

<div class="page">
	<Text>
		<h1>Docs for LLMs</h1>

		<p>
			We support the <a href="https://llmstxt.org/">llms.txt</a> convention for making documentation
			available to large language models and the applications that make use of them.
		</p>

		<p>Currently, we have the following root-level files...</p>

		<ul>
			<li><a href="/llms.txt">/llms.txt</a> — a listing of the available files</li>
			<li>
				<a href="/llms-full.txt">/llms-full.txt</a> — complete documentation for Svelte, SvelteKit and
				the CLI
			</li>
			<li>
				<a href="/llms-medium.txt">/llms-medium.txt</a> — compressed documentation for use with medium
				context windows
			</li>
			<li>
				<a href="/llms-small.txt">/llms-small.txt</a> — highly compressed documentation for use with
				smaller context windows
			</li>
		</ul>

		<p>...and package-level documentation:</p>

		<ul>
			<li>
				<a href="/docs/svelte/llms.txt">/docs/svelte/llms.txt</a> /
				<a href="/docs/svelte/llms-small.txt">/docs/svelte/llms-small.txt</a>
			</li>
			<li>
				<a href="/docs/kit/llms.txt">/docs/kit/llms.txt</a> /
				<a href="/docs/kit/llms-small.txt">/docs/kit/llms-small.txt</a>
			</li>
			<li><a href="/docs/cli/llms.txt">/docs/cli/llms.txt</a></li>
		</ul>
	</Text>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: auto;
		text-wrap: balance;
	}
</style>
