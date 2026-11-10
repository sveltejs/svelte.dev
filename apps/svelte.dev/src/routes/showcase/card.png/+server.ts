import { render_card } from '#lib/server/card.ts';
import Card from './Card.svelte';

export const prerender = true;

export function GET() {
	return render_card(Card, {});
}
