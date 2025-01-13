import { MediaQuery } from 'svelte/reactivity';
import { Persisted } from './Persisted.svelte';

class Theme {
	#preference = new Persisted<'system' | 'light' | 'dark'>('sv:theme', 'system');
	#query = new MediaQuery('prefers-color-scheme: dark');
	#system = $derived<'dark' | 'light'>(this.#query.current ? 'dark' : 'light');

	get current() {
		return this.#preference.current === 'system' ? this.#system : this.#preference.current;
	}

	set current(value: 'light' | 'dark') {
		this.#preference.current = value === this.#system ? 'system' : value;
	}
}

export const theme = new Theme();
