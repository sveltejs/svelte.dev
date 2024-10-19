import { setContext, getContext } from 'svelte';

/**
 * @typedef {{
 *   collapsed: import('svelte/store').Writable<Record<string, boolean>>;
 *   add: (name: string, type: 'file' | 'directory') => Promise<void>;
 *   rename: (stub: import('editor').Item, name: string) => Promise<void>;
 *   remove: (stub: import('editor').Item) => Promise<void>;
 *   select: (name: string) => void;
 *   workspace: import('editor').Workspace
 * }} FileTreeContext
 */

const key = {};

/** @param {FileTreeContext} context */
export function set(context) {
	setContext(key, context);
}

export function get() {
	return /** @type {FileTreeContext} */ (getContext(key));
}
