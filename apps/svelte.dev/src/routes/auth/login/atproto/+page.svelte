<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const LEADING_AT_REGEX = /^@/;
	const AT_URI_REGEX = /^at:\/\//;
	const TRAILING_SLASH_REGEX = /\/+$/;

	// Accepts a handle, a DID, an at:// URI, or a pasted profile / apps URL.
	function normalize(input: string) {
		let s = input.trim().replace(LEADING_AT_REGEX, '').replace(AT_URI_REGEX, '');
		if (s.includes('/')) {
			s = s.replace(TRAILING_SLASH_REGEX, '');
			s = s.slice(s.lastIndexOf('/') + 1);
		}
		return s.split('?')[0].replace(LEADING_AT_REGEX, '');
	}

	// `?escalate=1` re-runs consent for the current account asking for the private-apps
	// (space) scope; `&delete=1` adds the permission to delete the space
	const escalate = page.url.searchParams.get('escalate') === '1';
	const can_delete = page.url.searchParams.get('delete') === '1';

	let busy = $state(escalate);

	function start(query: Record<string, string>) {
		busy = true;
		location.assign(`/auth/atproto/authorize?${new URLSearchParams(query)}`);
	}

	onMount(() => {
		// atproto forbids `localhost` as a loopback origin
		if (location.hostname === 'localhost') {
			location.replace(location.href.replace('//localhost', '//127.0.0.1'));
			return;
		}
		if (escalate) start({ escalate: '1', ...(can_delete ? { delete: '1' } : {}) });
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		const actor = normalize(
			new FormData(e.target as HTMLFormElement).get('handle')?.toString() ?? ''
		);
		if (actor) start({ actor });
	}
</script>

<svelte:head>
	<title>Connect • Svelte</title>
</svelte:head>

<form class="login" onsubmit={submit}>
	<h1>Connect with your Atmosphere account</h1>

	<label for="handle">Handle</label>
	<div class="row">
		<input
			id="handle"
			name="handle"
			placeholder="your.atmosphere.handle"
			autocomplete="off"
			autocapitalize="none"
			autocorrect="off"
			spellcheck="false"
			inputmode="url"
			required
		/>
		<button type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Connect'}</button>
	</div>
</form>

<style>
	.login {
		max-width: 40rem;
		margin: 0 auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font: var(--sk-font-ui-medium);
	}

	h1 {
		font: var(--sk-font-h3);
		margin-bottom: 1rem;
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
		height: 3.6rem;
		padding: 0 1.4rem;
		border-radius: var(--sk-border-radius);
		background: var(--sk-fg-accent);
		color: white;
		white-space: nowrap;
	}
</style>
