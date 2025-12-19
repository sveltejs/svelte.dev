import fs from 'node:fs';
import path from 'node:path';
import { SHIKI_LANGUAGE_MAP, strip_origin } from './utils.ts';
import type { Declaration, TypeElement, Modules } from './index.ts';

/**
 * Replace module/export placeholders during `sync-docs`
 */
export async function preprocess(file: string, modules: Modules) {
	let content = fs.readFileSync(file, 'utf-8');

	const REGEXES = {
		/** Render a specific type from a module with more details. Example: `> EXPANDED_TYPES: svelte#compile` */
		EXPANDED_TYPES: /> EXPANDED_TYPES: (.+?)#(.+)$/gm,
		/** Render types from a specific module. Example: `> TYPES: svelte` */
		TYPES: /> TYPES: (.+?)(?:#(.+))?$/gm,
		/** Render all exports and types from a specific module. Example: `> MODULE: svelte` */
		MODULE: /> MODULE: (.+?)$/gm,
		/** Render the snippet of a specific export. Example: `> EXPORT_SNIPPET: svelte#compile` */
		EXPORT_SNIPPET: /> EXPORT_SNIPPET: (.+?)#(.+)?$/gm,
		/** Render all modules. Example: `> MODULES` */
		MODULES: /> MODULES/g, //! /g is VERY IMPORTANT, OR WILL CAUSE INFINITE LOOP
		/** Include the contents of another file */
		INCLUDE: /@include (.+)/g
	};

	content = await async_replace(content, REGEXES.EXPANDED_TYPES, async ([_, name, id]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name}`);
		if (!module.types) return '';

		const type = module.types.find((t) => t.name === id);

		if (!type) throw new Error(`Could not find type ${name}#${id}`);

		return stringify_expanded_type(type);
	});

	content = await async_replace(content, REGEXES.TYPES, async ([_, name, id]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name}`);
		if (!module.types) return '';

		if (id) {
			const type = module.types.find((t) => t.name === id);

			if (!type) throw new Error(`Could not find type ${name}#${id}`);

			return render_declaration(type, true);
		}

		let comment = '';
		if (module.comment) {
			comment += `${module.comment}\n\n`;
		}

		return (
			comment + module.types.map((t) => `## ${t.name}\n\n${render_declaration(t, true)}`).join('')
		);
	});

	content = await async_replace(content, REGEXES.EXPORT_SNIPPET, async ([_, name, id]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name} for EXPORT_SNIPPET clause`);

		if (!id) {
			throw new Error(`id is required for module ${name}`);
		}

		const exported = module.exports?.filter((t) => t.name === id);

		return exported?.map((d) => render_declaration(d, false)).join('\n\n') ?? '';
	});

	content = await async_replace(content, REGEXES.MODULE, async ([_, name]) => {
		const module = modules.find((module) => module.name === name);
		if (!module) throw new Error(`Could not find module ${name}`);

		return stringify_module(module);
	});

	content = await async_replace(content, REGEXES.MODULES, async () => {
		return modules
			.map((module) => {
				if (!module.exports) return;

				if (module.exports.length === 0 && !module.exempt) return '';

				let import_block = '';

				if (module.exports.length > 0) {
					// deduplication is necessary for now, because of `error()` overload
					const exports = Array.from(new Set(module.exports?.map((x) => x.name)));

					let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
					if (declaration.length > 80) {
						declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
					}

					import_block = fence(declaration, 'js');
				}

				return `## ${module.name}\n\n${import_block}\n\n${module.comment}\n\n${module.exports
					.map((declaration) => {
						const markdown = render_declaration(declaration, true);
						return `### ${declaration.name}\n\n${markdown}`;
					})
					.join('\n\n')}`;
			})
			.join('\n\n');
	});

	content = await async_replace(content, REGEXES.INCLUDE, ([_, include]) => {
		const resolved = path.resolve(path.dirname(file), include);
		return preprocess(resolved, modules);
	});

	return content;
}

function render_declaration(declaration: Declaration, full: boolean) {
	let content = '';

	if (declaration.deprecated) {
		content += `<blockquote class="tag deprecated note">\n\n${declaration.deprecated}\n\n</blockquote>\n\n`;
	}

	if (declaration.since) {
		content += `<blockquote class="since note">\n\nAvailable since ${declaration.since}\n\n</blockquote>\n\n`;
	}

	if (declaration.comment) {
		content += strip_origin(declaration.comment) + '\n\n';
	}

	return (
		content +
		declaration.overloads
			.map((overload) => {
				const children = full
					? overload.children?.map((val) => stringify(val, 'dts')).join('\n\n')
					: '';

				return `<div class="ts-block">${fence(overload.snippet, 'dts')}${children}</div>\n\n`;
			})
			.join('')
	);
}

async function async_replace(
	inputString: string,
	regex: RegExp,
	asyncCallback: (match: RegExpExecArray) => string | Promise<string>
) {
	let match;
	let previousLastIndex = 0;
	let parts = [];

	// While there is a match
	while ((match = regex.exec(inputString)) !== null) {
		// Add the text before the match
		parts.push(inputString.slice(previousLastIndex, match.index));

		// Perform the asynchronous operation for the match and add the result
		parts.push(await asyncCallback(match));

		// Update the previous last index
		previousLastIndex = regex.lastIndex;

		// Avoid infinite loops with zero-width matches
		if (match.index === regex.lastIndex) {
			regex.lastIndex++;
		}
	}

	// Add the remaining text
	parts.push(inputString.slice(previousLastIndex));

	return parts.join('');
}

/**
 * Takes a module and returns a markdown string.
 */
function stringify_module(module: Modules[0]) {
	let content = '';

	if (module.exports && module.exports.length > 0) {
		// deduplication is necessary for now, because of method overloads
		const exports = Array.from(new Set(module.exports?.map((x) => x.name)));

		let declaration = `import { ${exports.join(', ')} } from '${module.name}';`;
		if (declaration.length > 80) {
			declaration = `import {\n\t${exports.join(',\n\t')}\n} from '${module.name}';`;
		}

		content += fence(declaration, 'js');
	}

	if (module.comment) {
		content += `${strip_origin(module.comment)}\n\n`;
	}

	for (const declaration of module.exports || []) {
		const markdown = render_declaration(declaration, true);
		content += `## ${declaration.name}\n\n${markdown}\n\n`;
	}

	for (const t of module.types || []) {
		content += `## ${t.name}\n\n` + render_declaration(t, true);
	}

	return content;
}

function stringify_expanded_type(type: Declaration) {
	return (
		type.comment +
		type.overloads
			.map((overload) =>
				overload.children
					?.map((child) => {
						let section = `## ${child.name}`;

						if (child.bullets) {
							section += `\n\n<div class="ts-block-property-bullets">\n\n${child.bullets.join(
								'\n'
							)}\n\n</div>`;
						}

						section += `\n\n${child.comment}`;

						if (child.children) {
							section += `\n\n<div class="ts-block-property-children">\n\n${child.children
								.map((v) => stringify(v))
								.join('\n')}\n\n</div>`;
						}

						return section;
					})
					.join('\n\n')
			)
			.join('\n\n')
	);
}

/**
 * Helper function for {@link replace_export_type_placeholders}. Renders specifiv members to their markdown/html representation.
 */
function stringify(member: TypeElement, lang: keyof typeof SHIKI_LANGUAGE_MAP = 'ts'): string {
	if (!member) return '';

	// It's important to always use two newlines after a dom tag or else markdown does not render it properly

	const bullet_block =
		(member.bullets?.length ?? 0) > 0
			? `\n\n<div class="ts-block-property-bullets">\n\n${member.bullets?.join('\n')}\n\n</div>`
			: '';

	const comment = member.comment
		? '\n\n' +
			member.comment
				.replace(/\/\/\/ type: (.+)/g, '/** @type {$1} */')
				.replace(/^(  )+/gm, (match, spaces) => {
					return '\t'.repeat(match.length / 2);
				})
		: '';

	const child_block =
		(member.children?.length ?? 0) > 0
			? `\n\n<div class="ts-block-property-children">${member.children
					?.map((val) => stringify(val, lang))
					.join('\n')}</div>`
			: '';

	return (
		`<div class="ts-block-property">${fence(member.snippet, lang)}` +
		`<div class="ts-block-property-details">` +
		bullet_block +
		comment +
		child_block +
		(bullet_block || comment || child_block ? '\n\n' : '') +
		'</div>\n</div>'
	);
}

function fence(code: string, lang: keyof typeof SHIKI_LANGUAGE_MAP = 'ts') {
	return (
		'\n\n```' +
		lang +
		'\n' +
		(['js', 'ts'].includes(lang) ? '// @noErrors\n' : '') +
		code +
		'\n```\n\n'
	);
}
