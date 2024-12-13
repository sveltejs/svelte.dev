import { minimatch } from 'minimatch';
import { dev } from '$app/environment';
import { docs, index } from './content';

interface GenerateLlmContentOptions {
	prefix?: string;
	ignore?: string[];
	minimize?: Partial<MinimizeOptions>;
	package?: string;
}

interface MinimizeOptions {
	remove_legacy: boolean;
	remove_note_blocks: boolean;
	remove_details_blocks: boolean;
	remove_playground_links: boolean;
	remove_prettier_ignore: boolean;
	normalize_whitespace: boolean;
}

const defaults: MinimizeOptions = {
	remove_legacy: false,
	remove_note_blocks: false,
	remove_details_blocks: false,
	remove_playground_links: false,
	remove_prettier_ignore: false,
	normalize_whitespace: false
};

export function generate_llm_content(options: GenerateLlmContentOptions = {}): string {
	let content = '';

	if (options.prefix) {
		content = `${options.prefix}\n\n`;
	}

	let current_section = '';
	const paths = sort_documentation_paths();

	for (const path of paths) {
		if (!should_include_file_llm_docs(path, options.ignore)) continue;

		// If a specific package is provided, only include its docs
		if (options.package) {
			if (!path.includes(`docs/${options.package}/`)) continue;
		} else {
			// For combined content, only include paths that match any package
			const doc_type = packages.find((p) => path.includes(`docs/${p}/`));
			if (!doc_type) continue;

			const section = get_documentation_start_title(doc_type);
			if (section !== current_section) {
				if (current_section) content += '\n';
				content += `${section}\n\n`;
				current_section = section;
			}
		}

		const doc_content = options.minimize
			? minimize_content(index[path].body, options.minimize)
			: index[path].body;
		if (doc_content.trim() === '') continue;

		content += `\n# ${index[path].metadata.title}\n\n`;
		content += doc_content;
		content += '\n';
	}

	return content;
}

export const packages = Object.keys(docs.topics).map((topic) => topic.split('/')[1]);

export const DOCUMENTATION_NAMES: Record<string, string> = {
	svelte: 'Svelte',
	kit: 'SvelteKit',
	cli: 'Svelte CLI'
};

export function get_documentation_title(type: string): string {
	return `This is the developer documentation for ${DOCUMENTATION_NAMES[type]}.`;
}

export function get_documentation_start_title(type: string): string {
	return `# Start of ${DOCUMENTATION_NAMES[type]} documentation`;
}

function minimize_content(content: string, options?: Partial<MinimizeOptions>): string {
	// Merge with defaults, but only for properties that are defined
	const settings: MinimizeOptions = { ...defaults, ...options };

	let minimized = content;

	if (settings.remove_legacy) {
		minimized = remove_quote_blocks(minimized, 'LEGACY');
	}

	if (settings.remove_note_blocks) {
		minimized = remove_quote_blocks(minimized, 'NOTE');
	}

	if (settings.remove_details_blocks) {
		minimized = remove_quote_blocks(minimized, 'DETAILS');
	}

	if (settings.remove_playground_links) {
		// Replace playground URLs with /[link] but keep the original link text
		minimized = minimized.replace(/\[([^\]]+)\]\(\/playground[^)]+\)/g, '[$1](/REMOVED)');
	}

	if (settings.remove_prettier_ignore) {
		minimized = minimized
			.split('\n')
			.filter((line) => line.trim() !== '<!-- prettier-ignore -->')
			.join('\n');
	}

	if (settings.normalize_whitespace) {
		minimized = minimized.replace(/\s+/g, ' ');
	}

	minimized = minimized.trim();

	return minimized;
}

function should_include_file_llm_docs(filename: string, ignore: string[] = []): boolean {
	if (ignore.some((pattern) => minimatch(filename, pattern))) {
		if (dev) console.log(`❌ Ignored by pattern: ${filename}`);
		return false;
	}

	return true;
}

function get_documentation_section_priority(path: string): number {
	if (path.includes('docs/svelte/')) return 0;
	if (path.includes('docs/kit/')) return 1;
	if (path.includes('docs/cli/')) return 2;
	return 3;
}

function sort_documentation_paths(): string[] {
	return Object.keys(index).sort((a, b) => {
		a = index[a].file;
		b = index[b].file;
		// First compare by section priority
		const priorityA = get_documentation_section_priority(a);
		const priorityB = get_documentation_section_priority(b);
		if (priorityA !== priorityB) return priorityA - priorityB;

		// Get directory paths
		const dirA = a.split('/').slice(0, -1).join('/');
		const dirB = b.split('/').slice(0, -1).join('/');

		// If in the same directory, prioritize index.md
		if (dirA === dirB) {
			if (a.endsWith('index.md')) return -1;
			if (b.endsWith('index.md')) return 1;
			return a.localeCompare(b);
		}

		// Otherwise sort by directory path
		return dirA.localeCompare(dirB);
	});
}

function remove_quote_blocks(content: string, blockType: string): string {
	return content
		.split('\n')
		.reduce((acc: string[], line: string, index: number, lines: string[]) => {
			// If we find a block (with or without additional text), skip it and all subsequent blockquote lines
			if (line.trim().startsWith(`> [!${blockType}]`)) {
				// Skip all subsequent lines that are part of the blockquote
				let i = index;
				while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
					i++;
				}
				// Update the index to skip all these lines
				index = i - 1;
				return acc;
			}

			// Only add the line if it's not being skipped
			acc.push(line);
			return acc;
		}, [])
		.join('\n');
}
