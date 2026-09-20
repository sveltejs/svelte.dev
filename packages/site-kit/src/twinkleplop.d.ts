type TwinkleplopHighlighter = (input: string, render?: unknown) => string;
type TwinkleplopLanguageFactory = (options?: unknown) => TwinkleplopHighlighter;

declare module '@twinkleplop/bash' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/css' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/json' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/markdown' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/svelte' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/toml' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/typescript' {
	export const language: TwinkleplopLanguageFactory;
}

declare module '@twinkleplop/yaml' {
	export const language: TwinkleplopLanguageFactory;
}
