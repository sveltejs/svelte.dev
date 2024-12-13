import { minimatch } from 'minimatch';
import { dev } from '$app/environment';
import { index } from './content';

interface GenerateLlmContentOptions {
	ignore?: string[];
	minimize?: Partial<MinimizeOptions>;
	sections: Section[];
}

interface MinimizeOptions {
	remove_legacy: boolean;
	remove_note_blocks: boolean;
	remove_details_blocks: boolean;
	remove_playground_links: boolean;
	remove_prettier_ignore: boolean;
	normalize_whitespace: boolean;
}

interface Section {
	slug: string;
	title: string;
}

const defaults: MinimizeOptions = {
	remove_legacy: false,
	remove_note_blocks: false,
	remove_details_blocks: false,
	remove_playground_links: false,
	remove_prettier_ignore: false,
	normalize_whitespace: false
};

export function generate_llm_content(options: GenerateLlmContentOptions): string {
	let content = '';

	for (const section of options.sections) {
		if (options.sections.length > 1) {
			content += `# Start of ${section.title} documentation\n\n`;
		}

		for (const [path, document] of Object.entries(index)) {
			if (!path.startsWith(`docs/${section.slug}`)) continue;

			if (options.ignore?.some((pattern) => minimatch(path, pattern))) {
				if (dev) console.log(`❌ Ignored by pattern: ${path}`);
				continue;
			}

			const doc_content = options.minimize
				? minimize_content(document.body, options.minimize)
				: document.body;
			if (doc_content.trim() === '') continue;

			content += `\n# ${document.metadata.title}\n\n`;
			content += doc_content;
			content += '\n';
		}
	}

	return content;
}

export const sections: Section[] = [
	{ slug: 'svelte', title: 'Svelte' },
	{ slug: 'kit', title: 'SvelteKit' },
	{ slug: 'cli', title: 'the Svelte CLI' }
];

export function get_documentation_title(section: Section): string {
	return `This is the developer documentation for ${section.title}.`;
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
