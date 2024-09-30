import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export function load({ cookies }) {
	if (!cookies.get('allowed')) {
		error(403, 'Forbidden');
	}
}

export const actions = {
	default: ({ cookies }) => {
		cookies.delete('allowed', { path: '/' });
		redirect(303, '/');
	}
};
