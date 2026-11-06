import type { Document } from '@sveltejs/site-kit';

/** Whether a reference section title is an exported identifier that can be linked. */
export function is_identifier(title: string) {
	return /^[A-Za-z_$][\w$]*$/.test(title);
}

export function get_reference_module(page: Pick<Document, 'file' | 'metadata' | 'sections'>) {
	if (!/(?:^|\/)docs\/[^/]+\/\d+-reference\/\d+-[^/]+\.md$/.test(page.file)) return;

	const module = page.metadata.title;
	if (!/^(?:@[\w.-]+\/)?[a-z_$][\w$.-]*(?:\/[\w$.-]+)*$/.test(module)) return;
	if (!page.sections.some((section) => is_identifier(section.title))) return;

	return module;
}
