<script lang="ts">
	let busy = $state(false);
</script>

<svelte:head>
	<title>Log in • Svelte</title>
</svelte:head>

<form
	class="login"
	action="/auth/atproto/authorize"
	onsubmit={() => {
		busy = true;
	}}
>
	<label for="actor">
		<h1>Log in with your Atmosphere account</h1>
	</label>

	<div class="row">
		<input
			id="handle"
			name="actor"
			placeholder="your.atmosphere.handle"
			autocapitalize="none"
			autocorrect="off"
			spellcheck="false"
			inputmode="url"
			required
		/>
		<button class="raised primary">{busy ? '...' : 'Log in'}</button>
	</div>
</form>

<style>
	.login {
		max-width: 40rem;
		height: 100vh;
		margin: 0 auto;
		padding: 2rem 2rem 4rem 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
		font: var(--sk-font-ui-medium);
	}

	h1 {
		font: var(--sk-font-h3);
		margin-bottom: 1rem;
		text-wrap: balance;
	}

	.row {
		display: flex;
		gap: 0.6rem;
	}

	input {
		flex: 1;
		min-width: 0;
		height: 3.6rem;
		padding: 0 1rem;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-1);
		color: inherit;
		font: inherit;
	}

	button {
		width: 10rem;
	}
</style>
