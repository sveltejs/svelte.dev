---
title: svelte/compiler
---



```js
// @noErrors
import {
	VERSION,
	compile,
	compileModule,
	migrate,
	parse,
	preprocess,
	walk
} from 'svelte/compiler';
```

## VERSION

The current version, as set in package.json.

/docs/svelte-compiler#svelte-version

<div class="ts-block">

```dts
const VERSION: string;
```

</div>



## compile

`compile` converts your `.svelte` source code into a JavaScript module that exports a component

<div class="ts-block">

```dts
function compile(
	source: string,
	options: CompileOptions
): CompileResult;
```

</div>



## compileModule

`compileModule` takes your JavaScript source code containing runes, and turns it into a JavaScript module.

<div class="ts-block">

```dts
function compileModule(
	source: string,
	options: ModuleCompileOptions
): CompileResult;
```

</div>



## migrate

Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
May throw an error if the code is too complex to migrate automatically.

<div class="ts-block">

```dts
function migrate(
	source: string,
	{
		filename,
		use_ts
	}?:
		| {
				filename?: string;
				use_ts?: boolean;
		  }
		| undefined
): {
	code: string;
};
```

</div>



## parse

The parse function parses a component, returning only its abstract syntax tree.

The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
`modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.

<div class="ts-block">

```dts
function parse(
	source: string,
	options: {
		filename?: string;
		modern: true;
	}
): AST.Root;
```

</div>

<div class="ts-block">

```dts
function parse(
	source: string,
	options?:
		| {
				filename?: string;
				modern?: false;
		  }
		| undefined
): Record<string, any>;
```

</div>



## preprocess

The preprocess function provides convenient hooks for arbitrarily transforming component source code.
For example, it can be used to convert a `<style lang="sass">` block into vanilla CSS.

<div class="ts-block">

```dts
function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?:
		| {
				filename?: string;
		  }
		| undefined
): Promise<Processed>;
```

</div>



## walk

<blockquote class="tag deprecated">

Replace this with `import { walk } from 'estree-walker'`

</blockquote>

<div class="ts-block">

```dts
function walk(): never;
```

</div>



## AST

<div class="ts-block">

```dts
namespace AST {
	export interface BaseNode {
		type: string;
		start: number;
		end: number;
	}

	export interface Fragment {
		type: 'Fragment';
		nodes: Array<
			Text | Tag | ElementLike | Block | Comment
		>;
	}

	export interface Root extends BaseNode {
		type: 'Root';
		/**
		 * Inline options provided by `<svelte:options>` — these override options passed to `compile(...)`
		 */
		options: SvelteOptions | null;
		fragment: Fragment;
		/** The parsed `<style>` element, if exists */
		css: Css.StyleSheet | null;
		/** The parsed `<script>` element, if exists */
		instance: Script | null;
		/** The parsed `<script module>` element, if exists */
		module: Script | null;
	}

	export interface SvelteOptions {
		// start/end info (needed for warnings and for our Prettier plugin)
		start: number;
		end: number;
		// options
		runes?: boolean;
		immutable?: boolean;
		accessors?: boolean;
		preserveWhitespace?: boolean;
		namespace?: Namespace;
		css?: 'injected';
		customElement?: {
			tag?: string;
			shadow?: 'open' | 'none';
			props?: Record<
				string,
				{
					attribute?: string;
					reflect?: boolean;
					type?:
						| 'Array'
						| 'Boolean'
						| 'Number'
						| 'Object'
						| 'String';
				}
			>;
			/**
			 * Is of type
			 * ```ts
			 * (ceClass: new () => HTMLElement) => new () => HTMLElement
			 * ```
			 */
			extend?: ArrowFunctionExpression | Identifier;
		};
		attributes: Attribute[];
	}

	/** Static text */
	export interface Text extends BaseNode {
		type: 'Text';
		/** Text with decoded HTML entities */
		data: string;
		/** The original text, with undecoded HTML entities */
		raw: string;
	}

	/** A (possibly reactive) template expression — `{...}` */
	export interface ExpressionTag extends BaseNode {
		type: 'ExpressionTag';
		expression: Expression;
	}

	/** A (possibly reactive) HTML template expression — `{@html ...}` */
	export interface HtmlTag extends BaseNode {
		type: 'HtmlTag';
		expression: Expression;
	}

	/** An HTML comment */
	// TODO rename to disambiguate
	export interface Comment extends BaseNode {
		type: 'Comment';
		/** the contents of the comment */
		data: string;
	}

	/** A `{@const ...}` tag */
	export interface ConstTag extends BaseNode {
		type: 'ConstTag';
		declaration: VariableDeclaration & {
			declarations: [
				VariableDeclarator & {
					id: Pattern;
					init: Expression;
				}
			];
		};
	}

	/** A `{@debug ...}` tag */
	export interface DebugTag extends BaseNode {
		type: 'DebugTag';
		identifiers: Identifier[];
	}

	/** A `{@render foo(...)} tag */
	export interface RenderTag extends BaseNode {
		type: 'RenderTag';
		expression:
			| SimpleCallExpression
			| (ChainExpression & {
					expression: SimpleCallExpression;
			  });
	}

	/** An `animate:` directive */
	export interface AnimateDirective extends BaseNode {
		type: 'AnimateDirective';
		/** The 'x' in `animate:x` */
		name: string;
		/** The y in `animate:x={y}` */
		expression: null | Expression;
	}

	/** A `bind:` directive */
	export interface BindDirective extends BaseNode {
		type: 'BindDirective';
		/** The 'x' in `bind:x` */
		name: string;
		/** The y in `bind:x={y}` */
		expression: Identifier | MemberExpression;
	}

	/** A `class:` directive */
	export interface ClassDirective extends BaseNode {
		type: 'ClassDirective';
		/** The 'x' in `class:x` */
		name: 'class';
		/** The 'y' in `class:x={y}`, or the `x` in `class:x` */
		expression: Expression;
	}

	/** A `let:` directive */
	export interface LetDirective extends BaseNode {
		type: 'LetDirective';
		/** The 'x' in `let:x` */
		name: string;
		/** The 'y' in `let:x={y}` */
		expression:
			| null
			| Identifier
			| ArrayExpression
			| ObjectExpression;
	}

	/** An `on:` directive */
	export interface OnDirective extends BaseNode {
		type: 'OnDirective';
		/** The 'x' in `on:x` */
		name: string;
		/** The 'y' in `on:x={y}` */
		expression: null | Expression;
		modifiers: string[];
	}

	/** A `style:` directive */
	export interface StyleDirective extends BaseNode {
		type: 'StyleDirective';
		/** The 'x' in `style:x` */
		name: string;
		/** The 'y' in `style:x={y}` */
		value:
			| true
			| ExpressionTag
			| Array<ExpressionTag | Text>;
		modifiers: Array<'important'>;
	}

	// TODO have separate in/out/transition directives
	/** A `transition:`, `in:` or `out:` directive */
	export interface TransitionDirective extends BaseNode {
		type: 'TransitionDirective';
		/** The 'x' in `transition:x` */
		name: string;
		/** The 'y' in `transition:x={y}` */
		expression: null | Expression;
		modifiers: Array<'local' | 'global'>;
		/** True if this is a `transition:` or `in:` directive */
		intro: boolean;
		/** True if this is a `transition:` or `out:` directive */
		outro: boolean;
	}

	/** A `use:` directive */
	export interface UseDirective extends BaseNode {
		type: 'UseDirective';
		/** The 'x' in `use:x` */
		name: string;
		/** The 'y' in `use:x={y}` */
		expression: null | Expression;
	}

	interface BaseElement extends BaseNode {
		name: string;
		attributes: Array<
			Attribute | SpreadAttribute | Directive
		>;
		fragment: Fragment;
	}

	export interface Component extends BaseElement {
		type: 'Component';
	}

	export interface TitleElement extends BaseElement {
		type: 'TitleElement';
		name: 'title';
	}

	export interface SlotElement extends BaseElement {
		type: 'SlotElement';
		name: 'slot';
	}

	export interface RegularElement extends BaseElement {
		type: 'RegularElement';
	}

	export interface SvelteBody extends BaseElement {
		type: 'SvelteBody';
		name: 'svelte:body';
	}

	export interface SvelteComponent extends BaseElement {
		type: 'SvelteComponent';
		name: 'svelte:component';
		expression: Expression;
	}

	export interface SvelteDocument extends BaseElement {
		type: 'SvelteDocument';
		name: 'svelte:document';
	}

	export interface SvelteElement extends BaseElement {
		type: 'SvelteElement';
		name: 'svelte:element';
		tag: Expression;
	}

	export interface SvelteFragment extends BaseElement {
		type: 'SvelteFragment';
		name: 'svelte:fragment';
	}

	export interface SvelteHead extends BaseElement {
		type: 'SvelteHead';
		name: 'svelte:head';
	}

	/** This is only an intermediate representation while parsing, it doesn't exist in the final AST */
	export interface SvelteOptionsRaw extends BaseElement {
		type: 'SvelteOptions';
		name: 'svelte:options';
	}

	export interface SvelteSelf extends BaseElement {
		type: 'SvelteSelf';
		name: 'svelte:self';
	}

	export interface SvelteWindow extends BaseElement {
		type: 'SvelteWindow';
		name: 'svelte:window';
	}

	/** An `{#each ...}` block */
	export interface EachBlock extends BaseNode {
		type: 'EachBlock';
		expression: Expression;
		context: Pattern;
		body: Fragment;
		fallback?: Fragment;
		index?: string;
		key?: Expression;
	}

	/** An `{#if ...}` block */
	export interface IfBlock extends BaseNode {
		type: 'IfBlock';
		elseif: boolean;
		test: Expression;
		consequent: Fragment;
		alternate: Fragment | null;
	}

	/** An `{#await ...}` block */
	export interface AwaitBlock extends BaseNode {
		type: 'AwaitBlock';
		expression: Expression;
		// TODO can/should we move these inside the ThenBlock and CatchBlock?
		/** The resolved value inside the `then` block */
		value: Pattern | null;
		/** The rejection reason inside the `catch` block */
		error: Pattern | null;
		pending: Fragment | null;
		then: Fragment | null;
		catch: Fragment | null;
	}

	export interface KeyBlock extends BaseNode {
		type: 'KeyBlock';
		expression: Expression;
		fragment: Fragment;
	}

	export interface SnippetBlock extends BaseNode {
		type: 'SnippetBlock';
		expression: Identifier;
		parameters: Pattern[];
		body: Fragment;
	}

	export interface Attribute extends BaseNode {
		type: 'Attribute';
		name: string;
		/**
		 * Quoted/string values are represented by an array, even if they contain a single expression like `"{x}"`
		 */
		value:
			| true
			| ExpressionTag
			| Array<Text | ExpressionTag>;
	}

	export interface SpreadAttribute extends BaseNode {
		type: 'SpreadAttribute';
		expression: Expression;
	}

	export interface Script extends BaseNode {
		type: 'Script';
		context: 'default' | 'module';
		content: Program;
		attributes: Attribute[];
	}
}
```

</div>

## CompileError

<div class="ts-block">

```dts
interface CompileError extends ICompileDiagnostic {}
```

</div>

## CompileOptions

<div class="ts-block">

```dts
interface CompileOptions extends ModuleCompileOptions {/*…*/}
```

<div class="ts-block-property">

```dts
name?: string;
```

<div class="ts-block-property-details">

Sets the name of the resulting JavaScript class (though the compiler will rename it if it would otherwise conflict with other variables in scope).
If unspecified, will be inferred from `filename`

</div>
</div>

<div class="ts-block-property">

```dts
customElement?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, tells the compiler to generate a custom element constructor instead of a regular Svelte component.

</div>
</div>

<div class="ts-block-property">

```dts
accessors?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`
- <span class="tag deprecated">deprecated</span> This will have no effect in runes mode

</div>

If `true`, getters and setters will be created for the component's props. If `false`, they will only be created for readonly exported values (i.e. those declared with `const`, `class` and `function`). If compiling with `customElement: true` this option defaults to `true`.

</div>
</div>

<div class="ts-block-property">

```dts
namespace?: Namespace;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `'html'`

</div>

The namespace of the element; e.g., `"html"`, `"svg"`, `"mathml"`.

</div>
</div>

<div class="ts-block-property">

```dts
immutable?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`
- <span class="tag deprecated">deprecated</span> This will have no effect in runes mode

</div>

If `true`, tells the compiler that you promise not to mutate any objects.
This allows it to be less conservative about checking whether values have changed.

</div>
</div>

<div class="ts-block-property">

```dts
css?: 'injected' | 'external';
```

<div class="ts-block-property-details">

- `'injected'`: styles will be included in the `head` when using `render(...)`, and injected into the document (if not already present) when the component mounts. For components compiled as custom elements, styles are injected to the shadow root.
- `'external'`: the CSS will only be returned in the `css` field of the compilation result. Most Svelte bundler plugins will set this to `'external'` and use the CSS that is statically generated for better performance, as it will result in smaller JavaScript bundles and the output can be served as cacheable `.css` files.
This is always `'injected'` when compiling with `customElement` mode.

</div>
</div>

<div class="ts-block-property">

```dts
cssHash?: CssHashGetter;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `undefined`

</div>

A function that takes a `{ hash, css, name, filename }` argument and returns the string that is used as a classname for scoped CSS.
It defaults to returning `svelte-${hash(css)}`.

</div>
</div>

<div class="ts-block-property">

```dts
preserveComments?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, your HTML comments will be preserved in the output. By default, they are stripped out.

</div>
</div>

<div class="ts-block-property">

```dts
preserveWhitespace?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, whitespace inside and between elements is kept as you typed it, rather than removed or collapsed to a single space where possible.

</div>
</div>

<div class="ts-block-property">

```dts
runes?: boolean | undefined;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `undefined`

</div>

Set to `true` to force the compiler into runes mode, even if there are no indications of runes usage.
Set to `false` to force the compiler into ignoring runes, even if there are indications of runes usage.
Set to `undefined` (the default) to infer runes mode from the component code.
Is always `true` for JS/TS modules compiled with Svelte.
Will be `true` by default in Svelte 6.
Note that setting this to `true` in your `svelte.config.js` will force runes mode for your entire project, including components in `node_modules`,
which is likely not what you want. If you're using Vite, consider using [dynamicCompileOptions](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#dynamiccompileoptions) instead.

</div>
</div>

<div class="ts-block-property">

```dts
discloseVersion?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `true`

</div>

If `true`, exposes the Svelte major version in the browser by adding it to a `Set` stored in the global `window.__svelte.v`.

</div>
</div>

<div class="ts-block-property">

```dts
compatibility?: {/*…*/}
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag deprecated">deprecated</span> Use these only as a temporary solution before migrating your code

</div>

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
componentApi?: 4 | 5;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `5`

</div>

Applies a transformation so that the default export of Svelte files can still be instantiated the same way as in Svelte 4 —
as a class when compiling for the browser (as though using `createClassComponent(MyComponent, {...})` from `svelte/legacy`)
or as an object with a `.render(...)` method when compiling for the server

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
sourcemap?: object | string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `null`

</div>

An initial sourcemap that will be merged into the final output sourcemap.
This is usually the preprocessor sourcemap.

</div>
</div>

<div class="ts-block-property">

```dts
outputFilename?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `null`

</div>

Used for your JavaScript sourcemap.

</div>
</div>

<div class="ts-block-property">

```dts
cssOutputFilename?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `null`

</div>

Used for your CSS sourcemap.

</div>
</div>

<div class="ts-block-property">

```dts
hmr?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, compiles components with hot reloading support.

</div>
</div>

<div class="ts-block-property">

```dts
modernAst?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, returns the modern version of the AST.
Will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.

</div>
</div></div>

## CompileResult

The return value of `compile` from `svelte/compiler`

<div class="ts-block">

```dts
interface CompileResult {/*…*/}
```

<div class="ts-block-property">

```dts
js: {/*…*/}
```

<div class="ts-block-property-details">

The compiled JavaScript

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
code: string;
```

<div class="ts-block-property-details">

The generated code

</div>
</div>
<div class="ts-block-property">

```dts
map: SourceMap;
```

<div class="ts-block-property-details">

A source map

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
css: null | {
	/** The generated code */
	code: string;
	/** A source map */
	map: SourceMap;
};
```

<div class="ts-block-property-details">

The compiled CSS

</div>
</div>

<div class="ts-block-property">

```dts
warnings: Warning[];
```

<div class="ts-block-property-details">

An array of warning objects that were generated during compilation. Each warning has several properties:
- `code` is a string identifying the category of warning
- `message` describes the issue in human-readable terms
- `start` and `end`, if the warning relates to a specific location, are objects with `line`, `column` and `character` properties

</div>
</div>

<div class="ts-block-property">

```dts
metadata: {/*…*/}
```

<div class="ts-block-property-details">

Metadata about the compiled component

<div class="ts-block-property-children"><div class="ts-block-property">

```dts
runes: boolean;
```

<div class="ts-block-property-details">

Whether the file was compiled in runes mode, either because of an explicit option or inferred from usage.
For `compileModule`, this is always `true`

</div>
</div></div>

</div>
</div>

<div class="ts-block-property">

```dts
ast: any;
```

<div class="ts-block-property-details">

The AST

</div>
</div></div>

## MarkupPreprocessor

A markup preprocessor that takes a string of code and returns a processed version.

<div class="ts-block">

```dts
type MarkupPreprocessor = (options: {
	/**
	 * The whole Svelte file content
	 */
	content: string;
	/**
	 * The filename of the Svelte file
	 */
	filename?: string;
}) => Processed | void | Promise<Processed | void>;
```

</div>

## ModuleCompileOptions

<div class="ts-block">

```dts
interface ModuleCompileOptions {/*…*/}
```

<div class="ts-block-property">

```dts
dev?: boolean;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `false`

</div>

If `true`, causes extra code to be added that will perform runtime checks and provide debugging information during development.

</div>
</div>

<div class="ts-block-property">

```dts
generate?: 'client' | 'server' | false;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `'client'`

</div>

If `"client"`, Svelte emits code designed to run in the browser.
If `"server"`, Svelte emits code suitable for server-side rendering.
If `false`, nothing is generated. Useful for tooling that is only interested in warnings.

</div>
</div>

<div class="ts-block-property">

```dts
filename?: string;
```

<div class="ts-block-property-details">

Used for debugging hints and sourcemaps. Your bundler plugin will set it automatically.

</div>
</div>

<div class="ts-block-property">

```dts
rootDir?: string;
```

<div class="ts-block-property-details">

<div class="ts-block-property-bullets">

- <span class="tag">default</span> `process.cwd() on node-like environments, undefined elsewhere`

</div>

Used for ensuring filenames don't leak filesystem information. Your bundler plugin will set it automatically.

</div>
</div>

<div class="ts-block-property">

```dts
warningFilter?: (warning: Warning) => boolean;
```

<div class="ts-block-property-details">

A function that gets a `Warning` as an argument and returns a boolean.
Use this to filter out warnings. Return `true` to keep the warning, `false` to discard it.

</div>
</div></div>

## Preprocessor

A script/style preprocessor that takes a string of code and returns a processed version.

<div class="ts-block">

```dts
type Preprocessor = (options: {
	/**
	 * The script/style tag content
	 */
	content: string;
	/**
	 * The attributes on the script/style tag
	 */
	attributes: Record<string, string | boolean>;
	/**
	 * The whole Svelte file content
	 */
	markup: string;
	/**
	 * The filename of the Svelte file
	 */
	filename?: string;
}) => Processed | void | Promise<Processed | void>;
```

</div>

## PreprocessorGroup

A preprocessor group is a set of preprocessors that are applied to a Svelte file.

<div class="ts-block">

```dts
interface PreprocessorGroup {/*…*/}
```

<div class="ts-block-property">

```dts
name?: string;
```

<div class="ts-block-property-details">

Name of the preprocessor. Will be a required option in the next major version

</div>
</div>

<div class="ts-block-property">

```dts
markup?: MarkupPreprocessor;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
style?: Preprocessor;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
script?: Preprocessor;
```

<div class="ts-block-property-details"></div>
</div></div>

## Processed

The result of a preprocessor run. If the preprocessor does not return a result, it is assumed that the code is unchanged.

<div class="ts-block">

```dts
interface Processed {/*…*/}
```

<div class="ts-block-property">

```dts
code: string;
```

<div class="ts-block-property-details">

The new code

</div>
</div>

<div class="ts-block-property">

```dts
map?: string | object;
```

<div class="ts-block-property-details">

A source map mapping back to the original code

</div>
</div>

<div class="ts-block-property">

```dts
dependencies?: string[];
```

<div class="ts-block-property-details">

A list of additional files to watch for changes

</div>
</div>

<div class="ts-block-property">

```dts
attributes?: Record<string, string | boolean>;
```

<div class="ts-block-property-details">

Only for script/style preprocessors: The updated attributes to set on the tag. If undefined, attributes stay unchanged.

</div>
</div>

<div class="ts-block-property">

```dts
toString?: () => string;
```

<div class="ts-block-property-details"></div>
</div></div>

## Warning

<div class="ts-block">

```dts
interface Warning extends ICompileDiagnostic {}
```

</div>


