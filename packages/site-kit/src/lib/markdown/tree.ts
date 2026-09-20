import { create_language, fallback, match, on, to_html, within } from '@twinkleplop/core';
import { compile, define_grammar } from '@twinkleplop/core/compile';
import * as TOKENS from '@twinkleplop/core/tokens';

const raw_grammar = define_grammar({
	name: 'tree',
	states: {
		main: {
			rules: [
				within('//', '\n', TOKENS.comment, { multiline: false }),
				within('[', ']', TOKENS.parameter),
				within('(', ')', TOKENS.type),
				match(['├', '└', '│', '─', '/', '\\'], TOKENS.punctuation),
				on([' ', '\t', '\n', '\r']),
				fallback({ token: TOKENS.property })
			]
		}
	}
});

const grammar = compile(raw_grammar);
const tokenize = create_language(grammar, []);

export function create_tree_highlighter() {
	const highlight = tokenize();
	return (input: string) => to_html(input, highlight(input));
}
