import * as cookie from 'cookie';
import flru from 'flru';
import { client } from './client.js';
import * as local from './dev.js';
import { error } from '@sveltejs/kit';

/** @typedef {import('./types').User} User */

/**
 * @type {import('flru').flruCache<User | null>}
 */
const session_cache = flru(1000);

/**
 * @param {import('./types').GitHubUser} user
 */
export async function create(user) {
	if (local.enabled) {
		const { sessionid, userid, expires } = local.login(user);
		session_cache.set(sessionid, { id: userid, ...user });
		return { sessionid, expires: new Date(expires) };
	}

	if (!client) {
		error(500, 'Database client is not configured');
	}

	const result = await client.rpc('login', {
		user_github_id: user.github_id,
		user_github_name: user.github_name,
		user_github_login: user.github_login,
		user_github_avatar_url: user.github_avatar_url
	});

	if (result.error) {
		throw new Error(result.error.message);
	}

	session_cache.set(result.data.sessionid, {
		id: result.data.userid,
		github_name: user.github_name,
		github_login: user.github_login,
		github_avatar_url: user.github_avatar_url
	});

	return {
		sessionid: result.data.sessionid,
		expires: new Date(result.data.expires)
	};
}

/**
 * @param {string} sessionid
 * @returns {Promise<User | null>}
 */
export async function read(sessionid) {
	if (!sessionid) return null;
	if (local.enabled) return local.get_user(sessionid);
	if (!client) return null;

	if (!session_cache.get(sessionid)) {
		session_cache.set(
			sessionid,
			await client.rpc('get_user', { sessionid }).then(({ data, error }) => {
				if (error) {
					session_cache.set(sessionid, null);
					throw new Error(error.message);
				}

				return data.id && data;
			})
		);
	}

	return session_cache.get(sessionid) || null;
}

/** @param {string} sessionid */
export async function destroy(sessionid) {
	if (local.enabled) {
		local.logout(sessionid);
		session_cache.set(sessionid, null);
		return;
	}

	if (!client) {
		error(500, 'Database client is not configured');
	}

	const result = await client.rpc('logout', { sessionid });

	if (result.error) {
		throw new Error(result.error.message);
	}

	session_cache.set(sessionid, null);
}

/** @param {string | null} str */
export function from_cookie(str) {
	if (!str) return null;
	const sid = cookie.parse(str).sid;
	if (!sid) return null;
	return read(sid);
}
