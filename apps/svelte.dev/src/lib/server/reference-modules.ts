import type { Document } from '@sveltejs/site-kit';

export function get_reference_module(page: Pick<Document, 'file' | 'metadata' | 'sections'>) {
	if (!/(?:^|\/)docs\/[^/]+\/\d+-reference\/\d+-[^/]+\.md$/.test(page.file)) return;

	const module = page.metadata.title;
	if (!/^(?:@[\w.-]+\/)?[a-z_$][\w$.-]*(?:\/[\w$.-]+)*$/.test(module)) return;
	if (!page.sections.some((section) => /^[A-Za-z_$][\w$]*$/.test(section.title))) return;

	return module;
}
