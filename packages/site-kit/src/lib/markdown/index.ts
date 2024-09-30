export {
	render_content_markdown as renderContentMarkdown,
	replace_export_type_placeholders
} from './renderer';

export {
	extract_frontmatter as extractFrontmatter,
	transform as markedTransform,
	normalizeSlugify,
	slugify,
	removeMarkdown,
	escape
} from './utils';

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
