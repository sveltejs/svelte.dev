import type { User } from './db/types.d.ts';

export function display_name(user: User) {
	if (user.provider === 'atproto') return user.display_name || user.handle;
	return user.github_name || user.github_login;
}

export function avatar_url(user: User) {
	return (user.provider === 'atproto' ? user.avatar : user.github_avatar_url) || null;
}
