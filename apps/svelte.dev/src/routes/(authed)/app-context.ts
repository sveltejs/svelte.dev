import { getContext, setContext } from 'svelte';
import type { Destination } from '#lib/destination.js';

interface AppContext {
	login: (provider: 'github' | 'atproto') => Promise<void>;
	logout: (provider: 'github' | 'atproto') => Promise<void>;
	enable_private_apps: () => void;
	disable_private_apps: () => Promise<void>;
	set_destination: (destination: Destination) => Promise<void>;
}

export function set_app_context(context: AppContext) {
	setContext('app', context);
}

export function get_app_context(): AppContext {
	return getContext('app');
}
