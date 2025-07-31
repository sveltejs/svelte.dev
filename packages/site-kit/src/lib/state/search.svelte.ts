import { Persisted } from './Persisted.svelte';

class SearchState {
	#recent = new Persisted<string>('sv:recent-searches', '[]');
	active = $state(false);
	query = $state('');

	get recent() {
		return JSON.parse(this.#recent.current) as string[];
	}

	set recent(value) {
		this.#recent.current = JSON.stringify(value);
	}
}

export const search = new SearchState();
