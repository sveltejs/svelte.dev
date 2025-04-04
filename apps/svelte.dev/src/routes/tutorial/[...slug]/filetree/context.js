import { setContext, getContext } from 'svelte';

/**
 * @typedef {{
 *   collapsed: import('svelte/store').Writable<Record<string, boolean>>;
 *   add: (name: string, type: 'file' | 'directory') => Promise<void>;
 *   rename: (stub: import('@sveltejs/repl/workspace').Item, name: string) => Promise<void>;
 *   remove: (stub: import('@sveltejs/repl/workspace').Item) => Promise<void>;
 *   select: (name: string) => void;
 *   workspace: import('@sveltejs/repl/workspace').Workspace
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
