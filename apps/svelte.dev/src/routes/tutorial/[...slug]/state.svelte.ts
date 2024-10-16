import { writable } from 'svelte/store';
import type { Item } from 'editor';

export const solution = writable({} as Record<string, Item>);
