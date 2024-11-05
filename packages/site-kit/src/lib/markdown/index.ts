export { render_content_markdown } from './renderer';

export { transform, slugify, clean, strip_origin } from './utils';

// TODO none of these really belong here
export type Modules = Array<{
	name?: string;
	comment?: string;
	exempt?: boolean;
	types?: Declaration[];
	exports?: Declaration[];
}>;

export interface Declaration {
	name: string;
	comment: string;
	deprecated?: string | null;
	overloads: Array<{
		snippet: string;
		children: TypeElement[];
	}>;
}

export interface TypeElement {
	name: string;
	snippet: string;
	comment: string;
	bullets: string[];
	children: TypeElement[];
}
