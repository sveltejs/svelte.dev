<!--@component
the closing lines of the page, with the command to start a project of your own
-->
<script lang="ts">
	const command = 'npx sv create';

	/** shows a tick on the copy button for a moment after copying */
	let copied = $state(false);

	/** shows the tick as if pressed, for a press by the keyboard */
	let flash = $state(false);
	let uncopy: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		await navigator.clipboard.writeText(command);

		copied = true;
		clearTimeout(uncopy);
		uncopy = setTimeout(() => (copied = false), 2000);

		// shows the tick for a keyboard press too, which never makes the button :active, for a frame,
		// after which it fades back as it does once a pointer lets go
		flash = true;
		requestAnimationFrame(() => requestAnimationFrame(() => (flash = false)));
	}
</script>

<section class="next" aria-labelledby="your-turn">
	<h2 id="your-turn">It’s your turn</h2>

	<p>
		Use our CLI to create a new project, or try our
		<a href="/tutorial">interactive tutorial</a>.
	</p>

	<div class="command">
		<code>{command}</code>

		<!-- the copy icon turning to a tick as it is pressed, and back a moment later, like the copy
		     buttons on the code in the docs -->
		<button
			class={['raised', 'icon', 'copy', { flash }]}
			title="Copy to clipboard"
			aria-label="Copy to clipboard"
			onclick={copy}
		></button>

		<span class="visually-hidden" aria-live="polite">{copied ? 'Copied' : ''}</span>
	</div>
</section>

<style>
	.next {
		/* above the grey laid over the list it is in, so the link keeps its colour */
		position: relative;
		z-index: var(--lift, auto);
		margin: 16rem 0 0 0;
		padding-bottom: 8rem;
		text-align: center;

		@media (min-width: 1024px) {
			margin-top: 24rem;
			padding-bottom: 12rem;
		}
	}

	h2 {
		margin: 0;
		/* room for the descenders, which hang below the tight line height */
		padding-bottom: 0.08em;
		font: var(--display-font);
		letter-spacing: -0.02em;
		color: var(--sk-fg-1);
	}

	p {
		max-width: 20em;
		margin: 3.5rem auto 0;
		font: var(--lede-font);
		color: var(--sk-fg-3);
		text-wrap: balance;

		/* underlined like links in text elsewhere on the site, since it sits among words that are
		   not */
		a {
			text-decoration: underline;
		}
	}

	.command {
		display: inline-flex;
		align-items: center;
		gap: 2rem;
		margin: 3.6rem 0 0 0;
		padding: 1rem 1rem 1rem 2.4rem;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-2);

		code {
			padding: 0;
			background: none;
			font: var(--sk-font-mono);
			font-size: clamp(1.8rem, 1.4rem + 0.6vw, 2.4rem);
			color: var(--sk-fg-1);
		}

		@media (pointer: coarse) {
			button {
				width: 4.4rem;
				height: 4.4rem;
			}
		}
	}

	/* as the copy buttons on the code in the docs do it: the tick in place of the copy icon at once
	   as it is pressed, fading back to the copy icon a moment after it is let go */
	.copy {
		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: currentColor;
			mask: no-repeat 50% 50% / 1.6rem 1.6rem;
			transition: opacity 0.2s;
			transition-delay: 0.6s;
		}

		&::before {
			mask-image: url(icons/copy-to-clipboard);
		}

		&::after {
			mask-image: url(icons/check);
			opacity: 0;
		}

		&:is(:active, .flash)::before {
			opacity: 0;
			transition: none;
		}

		&:is(:active, .flash)::after {
			opacity: 1;
			transition: none;
		}
	}
</style>
