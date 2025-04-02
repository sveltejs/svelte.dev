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
	default?: T;
};

export const QueryParamSerde = {
	boolean(default_value?: boolean): Serde<boolean> {
		return {
			encode: (v) => (v ? 'true' : 'false'),
			decode: (v) => v === 'true',
			default: default_value
		};
	},

	string<T extends string = string>(default_value?: T): Serde<T> {
		return {
			encode: (v) => v,
			decode: (v) => v as T,
			default: default_value
		};
	},

	number(default_value?: number): Serde<number> {
		return {
			encode: (v) => v + '',
			decode: (v) => +v,
			default: default_value
		};
	},

	array<T extends string | number = string>(default_value?: T[]): Serde<T[]> {
		return {
			encode: (v) => v.join(','),
			decode: (v) => v.split(',').filter(Boolean) as T[],
			default: default_value
		};
	}
};

export function reactive_query_params<T extends Record<string, Serde<any>>>(
	params: T
): {
	[K in keyof T]: T[K] extends Serde<infer U>
		? T[K]['default'] extends undefined
			? U | undefined
			: U
		: never;
} & {
	url_from<K extends keyof T>(field: K, value: T[K] extends Serde<infer U> ? U : never): string;
} {
	const boxes: Record<string, Box<any>> = {};
	for (const [key, value] of Object.entries(params)) {
		boxes[key] = new Box<any>(
			() => {
				const param_value = page.url.searchParams.get(key);
				if (param_value) {
					return value.decode(param_value);
				}
				if (value.default !== undefined) {
					return value.default;
				}
				return value.decode('');
			},
			(val) => {
				const encoded = val != null ? value.encode(val) : undefined;
				if ((value.default == null || value.encode(value.default) !== encoded) && encoded) {
					page.url.searchParams.set(key, encoded);
				} else {
					page.url.searchParams.delete(key);
				}
				// So we don't run it when router hasn't initialized yet
				tick().then(() => replaceState(page.url, {}));
			}
		);
	}

	const returned = {} as ReturnType<typeof reactive_query_params>;
	for (const [key, value] of Object.entries(boxes)) {
		Object.defineProperty(returned, key, {
			get() {
				return value.current;
			},
			set(val: T) {
				value.current = val;
			}
		});
	}

	returned.url_from = <K extends keyof T>(
		field: K,
		value: T[K] extends Serde<infer U> ? U : never
	): string => {
		const encoded = value != null ? params[field as string].encode(value) : undefined;
		const new_url = new URL(page.url);
		if (encoded) {
			new_url.searchParams.set(field as string, encoded);
		} else {
			new_url.searchParams.delete(field as string);
		}
		return new_url.pathname + new_url.search;
	};

	return returned as any;
}
