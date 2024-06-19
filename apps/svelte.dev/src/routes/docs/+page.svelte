<div class="page">
	<div>
		<h2>Svelte</h2>
		<p>Svelte is a compiler-based framework for creating fast and efficient UIs.</p>
		<a class="cta basic" href="/docs/svelte">read the docs</a>
	</div>
	<div>
		<h2>SvelteKit</h2>
		<p>
			SvelteKit is a framework for rapidly developing robust, performant web applications using
			Svelte
		</p>
		<a class="cta basic" href="/docs/kit">read the docs</a>
	</div>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		justify-items: center;
		max-width: 100rem;
		margin: auto;

		& > div {
			padding: 2rem;
			max-width: 50rem;
		}
	}

	/* Copied from Hero.svelte - if we keep this design, deduplicate */
	.cta {
		display: flex;
		align-items: center;
		gap: 0.1rem;
		background: var(--sk-theme-1);
		padding: 0.35em 0.8em;
		font-size: var(--sk-text-s);
		letter-spacing: 0.05em;
		font-weight: 600;
		white-space: nowrap;
		border-radius: var(--sk-border-radius);
		box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.08);
		color: #fff;
		transition: 0.5s var(--quint-out);
		transition-property: box-shadow, color;
	}

	.cta:hover {
		text-decoration: none;
		box-shadow:
			0px 0.8px 3.8px rgba(0, 0, 0, 0.115),
			0px 6px 30px rgba(0, 0, 0, 0.23);
	}

	.cta.basic {
		background-color: var(--sk-back-5);
		color: var(--sk-text-1);
	}
</style>
