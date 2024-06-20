import { getContext, setContext } from 'svelte';

interface AppContext {
	login: () => void;
	logout: () => void;
}

export function set_app_context(context: AppContext) {
	setContext('app', context);
}

export function get_app_context(): AppContext {
	return getContext('app');
}
