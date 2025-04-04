import { writable } from 'svelte/store';
import type { Item } from '@sveltejs/repl/workspace';

export const solution = writable({} as Record<string, Item>);
