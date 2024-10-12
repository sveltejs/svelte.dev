<div class="terminal">
	<div class="chrome">
		<span class="dot"></span>
		<span class="dot"></span>
		<span class="dot"></span>
		<span class="title">terminal</span>
	</div>
	<pre><code
			><span class="line">npx <span class="orange-highlight">sv</span> create my-app</span>
<span class="line">cd my-app</span>
<span class="line">npm install</span>
<span class="line">npm run dev -- --open</span></code
		></pre>
</div>

<style>
	.terminal {
		background: #212121;
		margin: 0;
		border-radius: var(--sk-border-radius);
		overflow: hidden;
	}

	.terminal .chrome {
		position: relative;
		background: hsl(0, 0%, 10%);
		color: #999;
		display: flex;
		align-items: center;
		font-size: 1.8rem;
		padding: 1rem;
		gap: 1rem;
		border-bottom: 1px #29252a solid;
	}

	.terminal .dot {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background-color: #999;
	}

	.title {
		position: absolute;
		display: flex;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		padding-top: 0.4rem;
		align-items: center;
		justify-content: center;
		font-family: var(--sk-font-family-ui);
	}

	.terminal pre {
		font: var(--sk-font-mono);
		padding: 1em;
	}

	.line::before {
		content: '$ ';
		opacity: 0.3;
	}

	pre code {
		color: white;
		font-size: 1em;
	}

	.orange-highlight {
		color: hsl(15, 100%, 65%);
	}
</style>
