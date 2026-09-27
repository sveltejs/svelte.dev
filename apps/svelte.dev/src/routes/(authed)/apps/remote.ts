import { DESTINATION_COOKIE, DESTINATIONS } from '#lib/destination.ts';
import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';

export const set_destination = command(v.picklist(DESTINATIONS.map((d) => d.id)), (destination) => {
	console.log({ destination });

	const { cookies } = getRequestEvent();

	cookies.set(DESTINATION_COOKIE, destination, {
		maxAge: 60 * 60 * 24 * 365
	});
});
