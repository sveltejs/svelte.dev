// In browsers, `Request` and `Response` objects silently drop 'forbidden' headers
// such as `cookie`, `origin` and `set-cookie`. SvelteKit relies on these (for
// cookies and CSRF protection), so inside the sandbox we replace the globals with
// subclasses whose `headers` are an unguarded `Headers` object that we control

const NativeRequest = globalThis.Request;
const NativeResponse = globalThis.Response;

function merge_headers(base?: HeadersInit | null, override?: HeadersInit | null) {
	const headers = new Headers(base ?? undefined);

	if (override) {
		const overrides = new Headers(override);
		const names = new Set<string>();
		overrides.forEach((_, name) => names.add(name));
		for (const name of names) headers.delete(name);

		// `forEach` combines multiple `set-cookie` headers, so handle them separately
		for (const [name, value] of overrides) {
			if (name === 'set-cookie') continue;
			headers.append(name, value);
		}

		for (const cookie of overrides.getSetCookie()) {
			headers.append('set-cookie', cookie);
		}
	}

	return headers;
}

class SandboxRequest extends NativeRequest {
	#headers: Headers;

	constructor(input: RequestInfo | URL, init?: RequestInit) {
		super(input, init);
		this.#headers = merge_headers(
			input instanceof NativeRequest ? input.headers : undefined,
			init?.headers
		);
	}

	get headers() {
		return this.#headers;
	}

	clone(): Request {
		return new SandboxRequest(super.clone(), { headers: this.#headers });
	}
}

class SandboxResponse extends NativeResponse {
	#headers: Headers;

	constructor(body?: BodyInit | null, init?: ResponseInit) {
		super(body, init);
		this.#headers = merge_headers(super.headers, init?.headers);
	}

	get headers() {
		return this.#headers;
	}

	clone(): Response {
		const clone = super.clone();
		return new SandboxResponse(clone.body, {
			status: this.status,
			statusText: this.statusText,
			headers: this.#headers
		});
	}

	static json(data: any, init?: ResponseInit) {
		const headers = new Headers(init?.headers);
		if (!headers.has('content-type')) headers.set('content-type', 'application/json');
		return new SandboxResponse(JSON.stringify(data), { ...init, headers });
	}

	static redirect(url: string | URL, status = 302) {
		return new SandboxResponse(null, { status, headers: { location: String(url) } });
	}
}

globalThis.Request = SandboxRequest as typeof Request;
globalThis.Response = SandboxResponse as typeof Response;

export {};
