export const COLLECTION = 'dev.svelte.playground';
export const SPACE_TYPE = `${COLLECTION}.private`;
export const SPACE_KEY = 'self';

export const BASE_SCOPES = ['atproto', `repo:${COLLECTION}`];

// Private apps live in an atproto space (alpha). Never requested at first login: a
// stock PDS rejects the unknown scope. Deleting the space is a separate, on-demand consent.
const space_scope = (manage: string[]) =>
	`space:${SPACE_TYPE}?collection=${COLLECTION}&${manage.map((m) => `manage=${m}`).join('&')}`;

const SPACE_SCOPE = space_scope(['create']);
const SPACE_DELETE_SCOPE = space_scope(['create', 'delete']);

// client metadata must list every scope string we may request, literally
export const ALL_SCOPES = [...BASE_SCOPES, SPACE_SCOPE, SPACE_DELETE_SCOPE];

export function scopes_for(private_apps: boolean, can_delete = false) {
	if (!private_apps) return BASE_SCOPES.join(' ');
	return [...BASE_SCOPES, can_delete ? SPACE_DELETE_SCOPE : SPACE_SCOPE].join(' ');
}

export function space_ref(did: string) {
	return `at://${did}/space/${SPACE_TYPE}/${SPACE_KEY}`;
}
