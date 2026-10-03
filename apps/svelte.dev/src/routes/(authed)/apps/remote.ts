import { DESTINATION_COOKIE, DESTINATIONS } from '#lib/destination.js';
import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';

export const set_destination = command(v.picklist(DESTINATIONS.map((d) => d.id)), (destination) => {
	const { cookies, url } = getRequestEvent();

	cookies.set(DESTINATION_COOKIE, destination, {
		maxAge: 60 * 60 * 24 * 365,
		// like the session cookies: dev runs on 127.0.0.1, where Kit's default is Secure
		secure: url.protocol === 'https:'
	});
});
