<script>
	import Profile from './Profile.svelte';
</script>

<Profile>
	{#snippet}Bob{/snippet}
	{#snippet email()}bob@email.com{/snippet}
</Profile>

<Profile>
	{#snippet}Alice{/snippet}
	{#snippet phone()}12345678{/snippet}
</Profile>
