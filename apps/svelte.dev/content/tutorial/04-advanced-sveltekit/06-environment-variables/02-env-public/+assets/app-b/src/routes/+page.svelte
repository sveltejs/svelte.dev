<script>
	import {
		THEME_BACKGROUND,
		THEME_FOREGROUND
	} from '$app/env/public';
</script>

<main
	style:background={THEME_BACKGROUND}
	style:color={THEME_FOREGROUND}
>
	{THEME_FOREGROUND} on {THEME_BACKGROUND}
</main>

<style>
	main {
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: center;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		font-size: 10vmin;
	}
</style>
