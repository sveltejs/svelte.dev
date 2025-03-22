import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import { tick } from 'svelte';

export class Box<T> {
	#getter: () => T;
	#setter?: (value: T) => void;

	#derived = $derived.by(() => {
		let val = $state(this.#getter());

		return {
			get current() {
				return val;
			},
			set current(value) {
				val = value;
			}
		};
	});

	constructor(getter: () => T, setter?: (value: T) => void) {
		this.#getter = getter;
		this.#setter = setter;

		$effect(() => {
			this.#setter?.($state.snapshot(this.#derived.current) as T);
		});
	}

	get current(): T {
		return this.#derived.current;
	}

	set current(value: T) {
		this.#derived.current = value;
	}
}

export class ReactiveQueryParam<T = string> {
	#current: Box<T>;

	constructor(
		name: string,
		default_value?: T,
		{
			encode,
			decode
		}: {
			encode: (value: T) => string;
			decode: (value: string) => T;
		} = {
			encode: (v) => v + '',
			decode: (v) => v as T
		}
	) {
		this.#current = new Box<T>(
			() => decode(page.url.searchParams.get(name) ?? ''),
			(val) => {
				const encoded = val ? encode(val ?? default_value) : undefined;
				if (encoded) page.url.searchParams.set(name, encoded);
				else page.url.searchParams.delete(name);

				// So we don't run it when router hasn't initialized yet
				tick().then(() => replaceState(page.url, {}));
			}
		);
	}

	get current() {
		return this.#current.current;
	}

	set current(value: T) {
		this.#current.current = value;
	}
}
