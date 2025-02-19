<script lang="ts">
	import { Section } from '@sveltejs/site-kit/components';
</script>

<Section>
	<p class="copyright">
		© {new Date().getFullYear()} Svelte contributors. Svelte is
		<a href="https://github.com/sveltejs/svelte">free and open source software</a> released under the
		MIT license.
	</p>
</Section>

<style>
	.copyright {
		text-align: center;
	}
</style>
