import { getRequestEvent, query } from '$app/server';
import * as session from '$lib/db/session';

export const get_user = query(() => {
	const { request } = getRequestEvent();
	return session.from_cookie(request.headers.get('cookie'));
});
