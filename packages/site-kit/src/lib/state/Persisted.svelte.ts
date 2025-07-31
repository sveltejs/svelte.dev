import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';

export class Persisted<T extends string = string> {
	#key: string;
	#storage: Storage | undefined;
	#fallback: T;
	#version = $state(0);

	#subscribe = createSubscriber((update) => {
		return on(window, 'storage', (e) => {
			if (e.key === this.#key) {
				update();
			}
		});
	});

	constructor(
		key: string,
		fallback: T,
		storage = typeof localStorage === 'undefined' ? undefined : localStorage
	) {
		this.#key = key;
		this.#fallback = fallback;
		this.#storage = storage;
	}

	get current() {
		this.#subscribe(); // handle cross-tab updates
		this.#version; // handle same-tab updates

		return (this.#storage?.getItem(this.#key) as T) ?? this.#fallback;
	}

	set current(v: T) {
		this.#storage?.setItem(this.#key, v);
		this.#version += 1;
	}
}
