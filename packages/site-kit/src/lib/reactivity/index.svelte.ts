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

type Serde<T> = {
	encode: (value: T) => string;
	decode: (value: string) => T;
};

export class ReactiveQueryParam<T = string> {
	#current: Box<T>;

	#encode: (value: T) => string;
	#name: string;

	constructor(
		name: string,
		default_value?: T,
		{ encode, decode }: Serde<T> = ReactiveQueryParam.string as any
	) {
		this.#encode = encode;
		this.#name = name;

		this.#current = new Box<T>(
			() => {
				const param_value = page.url.searchParams.get(name);

				if (param_value) {
					return decode(param_value);
				}

				if (default_value) {
					return default_value;
				}

				return decode('');
			},
			(val) => {
				const encoded = val != null ? encode(val ?? default_value) : undefined;

				if ((default_value == null || encode(default_value) !== encoded) && encoded) {
					page.url.searchParams.set(name, encoded);
				} else {
					page.url.searchParams.delete(name);
				}

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

	url_from(value: T) {
		const encoded = this.#encode(value);
		const new_url = new URL(page.url);
		new_url.searchParams.set(this.#name, encoded);

		return new_url.pathname + new_url.search;
	}

	static get boolean(): Serde<boolean> {
		return {
			encode: (v) => (v ? 'true' : 'false'),
			decode: (v) => v === 'true'
		};
	}

	static get string(): Serde<string> {
		return {
			encode: (v) => v + '',
			decode: (v) => v as string
		};
	}

	static get number(): Serde<number> {
		return {
			encode: (v) => v + '',
			decode: (v) => +v
		};
	}

	static get array(): Serde<string[]> {
		return {
			encode: (v) => v.join(','),
			decode: (v) => v.split(',').filter(Boolean)
		};
	}
}
