import { resolve } from '#lib/atproto/identity.js';
import { oauth } from '#lib/atproto/oauth.js';
import { SCOPES } from '#lib/atproto/model.js';
import { redirect } from '@sveltejs/kit';

const LEADING_AT_REGEX = /^@/;
const AT_URI_REGEX = /^at:\/\//;
const TRAILING_SLASH_REGEX = /\/+$/;

// Accepts a handle, a DID, an at:// URI, or a pasted profile / apps URL.
function normalize(input: string) {
	let s = input.trim().replace(LEADING_AT_REGEX, '');
	// the authority of an at:// URI comes first; the account of a web URL comes last
	if (AT_URI_REGEX.test(s)) return s.replace(AT_URI_REGEX, '').split('/')[0];
	if (s.includes('/')) {
		s = s.replace(TRAILING_SLASH_REGEX, '');
		s = s.slice(s.lastIndexOf('/') + 1);
	}
	return s.split('?')[0].replace(LEADING_AT_REGEX, '');
}

/** Back to the login form, handle kept. */
function retry(actor: string, reason: 'unknown' | 'failed'): never {
	redirect(303, `/auth/login/atproto?${new URLSearchParams({ actor, error: reason })}`);
}

export async function GET({ url }) {
	const typed = url.searchParams.get('actor')?.trim() ?? '';
	const actor = normalize(typed);
	if (!actor) redirect(303, '/auth/login/atproto');

	const found = await resolve(actor).then(
		() => true,
		() => false
	);
	if (!found) retry(typed, 'unknown');

	let target: URL;
	try {
		target = await (await oauth(url.origin)).authorize(actor, { scopes: SCOPES });
	} catch {
		retry(typed, 'failed');
	}
	redirect(302, target.href, { external: true });
}
