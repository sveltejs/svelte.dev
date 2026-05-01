/** @type {Record<string, string>} */
const chars = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

const encoded_chars = Object.fromEntries(Object.entries(chars).map(([key, value]) => [value, key]));

const symbols_regex = new RegExp(`[${Object.keys(chars).join('')}]`, 'g');

const encoded_symbols_regex = new RegExp(
	`&(?:${Object.values(chars)
		.map((entity) => entity.slice(1, entity.length - 1))
		.join('|')});`,
	'g'
);

/** @param {string} html */
export function escape_html(html) {
	return html.replace(symbols_regex, (c) => chars[c] ?? c);
}

/** @param {string} html */
export function decode_html(html) {
	return html.replace(encoded_symbols_regex, (c) => encoded_chars[c] ?? c);
}
