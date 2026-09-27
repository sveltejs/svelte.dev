import { createContext } from 'svelte';
import type { Destination } from '#lib/destination.js';

interface AppContext {
	login: (provider: 'github' | 'atproto') => Promise<void>;
	logout: (provider: 'github' | 'atproto') => Promise<void>;
	enable_private_apps: () => void;
	disable_private_apps: () => Promise<void>;
}

export const [get_app_context, set_app_context] = createContext<AppContext>();
