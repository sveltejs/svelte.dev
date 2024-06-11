/** @type {Record<string, string>} */
const chars = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
};

/** @param {string} html */
export function escape_html(html) {
	return html.replace(/[&<>]/g, (c) => chars[c]);
}
