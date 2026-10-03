import { defineCollection, defineSpace, scopesFor } from 'airspace';
import { playground, private_space } from './lexicons.js';

export const playgrounds = defineCollection(playground, { sort: [['updatedAt', 'desc']] });

export const private_apps = defineSpace(private_space, { collections: { playgrounds } });

export const collections = { playgrounds };
export const spaces = { private_apps };

// no space scope at first login: a stock PDS rejects it. Deleting the space is its own consent.
export function scopes_for(with_private: boolean, can_delete = false) {
	if (!with_private) return scopesFor({ collections });
	return scopesFor({ collections, spaces, manage: can_delete ? ['create', 'delete'] : ['create'] });
}

// client metadata must list every scope string we may request, literally
export const ALL_SCOPES = [
	...new Set([...scopes_for(false), ...scopes_for(true), ...scopes_for(true, true)])
];
