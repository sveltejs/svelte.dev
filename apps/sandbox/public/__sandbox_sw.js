// Service worker for the tutorial sandbox. This runs on the *sandbox* origin (not
// svelte.dev itself) and intercepts requests from the preview iframe, forwarding
// them to the sandbox worker (via the relay page, which owns the worker) and
// returning its responses. Requests for the sandbox's own infrastructure (the
// relay page, the worker's own code) go to the network as normal.

const RELAY = '/__sandbox/relay.html';

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	if (url.origin !== self.location.origin) return;
	if (url.pathname === '/__sandbox_sw.js') return;

	if (url.pathname.startsWith('/@ssr/')) {
		event.respondWith(forward(event));
		return;
	}

	if (event.request.mode === 'navigate') {
		if (url.pathname.startsWith('/__sandbox/')) return;
		event.respondWith(forward(event));
		return;
	}

	event.respondWith(
		(async () => {
			const client = event.clientId ? await self.clients.get(event.clientId) : null;

			if (
				client &&
				(client.type === 'worker' || new URL(client.url).pathname.startsWith('/__sandbox/'))
			) {
				return fetch(event.request);
			}

			return forward(event);
		})()
	);
});

/** @param {FetchEvent} event */
async function forward(event) {
	const relay = await find_relay();

	if (!relay) {
		return new Response('Sandbox is not running', {
			status: 503,
			headers: { 'content-type': 'text/plain' }
		});
	}

	const request = event.request;
	const body =
		request.method === 'GET' || request.method === 'HEAD' ? null : await request.arrayBuffer();

	const { port1, port2 } = new MessageChannel();

	/** @type {Promise<any>} */
	const promise = new Promise((fulfil) => {
		port1.onmessage = (e) => fulfil(e.data);
	});

	relay.postMessage(
		{
			type: 'request',
			request: {
				url: request.url,
				method: request.method,
				headers: [...request.headers],
				referrer: request.referrer,
				destination: request.destination,
				mode: request.mode,
				body
			},
			port: port2
		},
		body ? [port2, body] : [port2]
	);

	const response = await promise;

	const headers = new Headers(response.headers);

	// the tutorial page is cross-origin isolated, so the preview needs these
	headers.set('cross-origin-embedder-policy', 'require-corp');
	headers.set('cross-origin-resource-policy', 'cross-origin');
	headers.set('cross-origin-opener-policy', 'same-origin');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

async function find_relay() {
	const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

	// TODO support multiple tabs. For now, the most recently created relay wins
	for (let i = clients.length - 1; i >= 0; i -= 1) {
		if (new URL(clients[i].url).pathname === RELAY) return clients[i];
	}

	return null;
}
