import { Marked, Renderer, type TokenizerObject } from 'marked';
import json5 from 'json5';

const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
const escapeReplacements = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

/**
 * @param {string} ch
 */
const getEscapeReplacement = (ch: string) =>
	escapeReplacements[ch as keyof typeof escapeReplacements];

export const SHIKI_LANGUAGE_MAP = {
	bash: 'bash',
	env: 'bash',
	html: 'svelte',
	svelte: 'svelte',
	sv: 'svelte',
	js: 'javascript',
	dts: 'typescript',
	css: 'css',
	diff: 'diff',
	ts: 'typescript',
	'': ''
};

export function escape(html: string, encode = false) {
	if (encode) {
		if (escapeTest.test(html)) {
			return html.replace(escapeReplace, getEscapeReplacement);
		}
	} else {
		if (escapeTestNoEncode.test(html)) {
			return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
		}
	}

	return html;
}

export function slugify(title: string) {
	return title
		.toLowerCase()
		.replace(/&.+;/g, '')
		.replace(/[^a-z0-9-$(.):<>]/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-/, '')
		.replace(/-$/, '');
}

export function removeMarkdown(markdown: string) {
	return markdown
		.replace(/\*\*(.+?)\*\*/g, '$1') // bold
		.replace(/_(.+?)_/g, '$1') // Italics
		.replace(/\*(.+?)\*/g, '$1') // Italics
		.replace(/`(.+?)`/g, '$1') // Inline code
		.replace(/~~(.+?)~~/g, '$1') // Strikethrough
		.replace(/\[(.+?)\]\(.+?\)/g, '$1') // Link
		.replace(/\n/g, ' ') // New line
		.replace(/ {2,}/g, ' ')
		.trim();
}

export function removeHTMLEntities(html: string) {
	return html.replace(/&.+?;/g, '');
}

export const normalizeSlugify = (str: string) => {
	return slugify(removeHTMLEntities(removeMarkdown(str))).replace(/(<([^>]+)>)/gi, '');
};

export function smart_quotes(str: string) {
	// replace dumb quotes with smart quotes. This isn't a perfect algorithm — it
	// wouldn't correctly handle `That '70s show` or `My country 'tis of thee`
	// but a) it's very unlikely they'll occur in our docs, and
	// b) they can be dealt with manually
	return str.replace(/(.|^)(&#39;|&quot;)(.|$)/g, (m, before, quote, after) => {
		const left = !before.trim();
		const double = quote === '&quot;';
		const entity = `&${left ? 'l' : 'r'}${double ? 'd' : 's'}quo;`;

		return (before ?? '') + entity + (after ?? '');
	});
}

const default_renderer: Partial<Renderer> = {
	code(code, infostring, escaped) {
		const lang = infostring?.match(/\S*/)?.[0];

		code = code.replace(/\n$/, '') + '\n';

		if (!lang) {
			return '<pre><code>' + (escaped ? code : escape(code, true)) + '</code></pre>\n';
		}

		return (
			'<pre><code class="language-' +
			escape(lang, true) +
			'">' +
			(escaped ? code : escape(code, true)) +
			'</code></pre>\n'
		);
	},

	blockquote(quote) {
		return '<blockquote>\n' + quote + '</blockquote>\n';
	},

	html(html) {
		return html;
	},

	heading(text, level) {
		return '<h' + level + '>' + text + '</h' + level + '>\n';
	},

	hr() {
		return '<hr>\n';
	},

	list(body, ordered, start) {
		const type = ordered ? 'ol' : 'ul',
			startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
		return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
	},

	listitem(text) {
		return '<li>' + text + '</li>\n';
	},

	checkbox(checked) {
		return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + '' + '> ';
	},

	paragraph(text) {
		return '<p>' + text + '</p>\n';
	},

	table(header, body) {
		if (body) body = '<tbody>' + body + '</tbody>';

		return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
	},

	tablerow(content) {
		return '<tr>\n' + content + '</tr>\n';
	},

	tablecell(content, flags) {
		const type = flags.header ? 'th' : 'td';
		const tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
		return tag + content + '</' + type + '>\n';
	},

	// span level renderer
	strong(text) {
		return '<strong>' + text + '</strong>';
	},

	em(text) {
		return '<em>' + text + '</em>';
	},

	codespan(text) {
		return '<code>' + text + '</code>';
	},

	br() {
		return '<br>';
	},

	del(text) {
		return '<del>' + text + '</del>';
	},

	link(href, title, text) {
		if (href === null) {
			return text;
		}
		let out = '<a href="' + escape(href) + '"';
		if (title) {
			out += ' title="' + title + '"';
		}
		out += '>' + text + '</a>';
		return out;
	},

	image(href, title, text) {
		if (href === null) {
			return text;
		}

		let out = '<img src="' + href + '" alt="' + text + '"';
		if (title) {
			out += ' title="' + title + '"';
		}
		out += '>';
		return out;
	},

	text(text) {
		return text;
	}
};

const tokenizer: TokenizerObject = {
	url(src) {
		// if `src` is a package version string, eg: adapter-auto@1.2.3
		// do not tokenize it as email
		if (/@\d+\.\d+\.\d+/.test(src)) {
			return undefined;
		}
		// else, use the default tokenizer behavior
		return false;
	}
};

export async function transform(markdown: string, renderer: Partial<Renderer> = {}) {
	const marked = new Marked({
		renderer: {
			...default_renderer,
			...renderer
		},
		tokenizer
	});

	return (await marked.parse(markdown)) ?? '';
}

export function extract_frontmatter(markdown: string) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) return { metadata: {}, body: markdown };

	const frontmatter = match[1];
	const body = markdown.slice(match[0].length).trim();

	const metadata: Record<string, string> = {};

	// Prettier might split things awkwardly, so we can't just go line-by-line

	/** @type {string} */
	let key = '';

	/** @type {string} */
	let value = '';

	for (const line of frontmatter.split('\n')) {
		const match = /^(\w+):\s*(.*)$/.exec(line);
		if (match) {
			if (key) metadata[key] = parse(value);

			key = match[1];
			value = match[2];
		} else {
			value += '\n' + line;
		}
	}

	if (key) metadata[key] = parse(value);

	return { metadata, body };
}

const parse = (str: string) => {
	try {
		return json5.parse(str);
	} catch (err) {
		return str;
	}
};
