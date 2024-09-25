import { BROWSER } from 'esm-env';
import { persisted } from 'svelte-persisted-store';

interface Theme {
	preference: 'light' | 'dark' | 'system';
	current: 'light' | 'dark';
}

export const theme = persisted<Theme>('svelte:theme', {
	preference: 'system',
	current: BROWSER
		? window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'
		: 'light'
});

theme.subscribe(($theme) => {
	if (!BROWSER) return;

	document.documentElement.classList.remove('light', 'dark');
	document.documentElement.classList.add($theme.current);
});
