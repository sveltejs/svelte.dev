export {
	render_content_markdown as renderContentMarkdown,
	replace_export_type_placeholders as replaceExportTypePlaceholders,
	stringify_module,
	stringify_type,
	stringify_expanded_type
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
	types?: ModuleChild[];
	exports?: ModuleChild[];
}>;
export interface ModuleChild {
	name: string;
	snippet: string;
	comment: string;
	deprecated?: string;
	bullets?: string[];
	children?: ModuleChild[];
}
