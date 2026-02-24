## Svelte

You **MUST** use the Svelte 5 API unless explicitly tasked to write Svelte 4 syntax. If you don't know about the API yet, below is the most important information about it. Other syntax not explicitly listed like `{#if ...}` blocks stay the same, so you can reuse your Svelte 4 knowledge for these.

- to mark something a state you use the `$state` rune, e.g. instead of `let count = 0` you do `let count = $state(0)`
- to mark something as a derivation you use the `$derived` rune, e.g. instead of `$: double = count * 2` you do `const double = $derived(count * 2)`
- to create a side effect you use the `$effect` rune, e.g. instead of `$: console.log(double)`you do`$effect(() => console.log(double))`
- to create component props you use the `$props` rune, e.g. instead of `export let foo = true; export let bar;` you do `let { foo = true, bar } = $props();`
- when listening to dom events do not use colons as part of the event name anymore, e.g. instead of `<button on:click={...} />` you do `<button onclick={...} />`

### What are runes?

- Runes are built-in Svelte keywords (prefixed with `$`) that control the compiler. For example, you write `let message = $state('hello');` in a `.svelte` file.
- Do **NOT** treat runes like regular functions or import them; instead, use them as language keywords.  
  _In Svelte 4, this syntax did not exist—you relied on reactive declarations and stores; now runes are an integral part of the language._

### $state

- `$state` creates reactive variables that update the UI automatically. For example:
  ```svelte
  <script>
    let count = $state(0);
  </script>
  <button onclick={() => count++}>Clicked: {count}</button>
  ```
- Do **NOT** complicate state management by wrapping it in custom objects; instead, update reactive variables directly.  
  _In Svelte 4, you created state with let, e.g. `let count = 0;`, now use the $state rune, e.g. `let count = $state(0);`._
- Arrays and objects become deeply reactive proxies. For example:
  ```js
  let todos = $state([{ done: false, text: 'add more todos' }]);
  todos[0].done = !todos[0].done;
  ```
- Do **NOT** destructure reactive proxies (e.g., `let { done } = todos[0];`), as this breaks reactivity; instead, access properties directly.
- Use `$state` in class fields for reactive properties. For example:
  ```js
  class Todo {
  	done = $state(false);
  	text = $state('');
  	reset = () => {
  		this.text = '';
  		this.done = false;
  	};
  }
  ```

### $state.raw

- `$state.raw` creates shallow state where mutations are not tracked. For example:

```js
let person = $state.raw({ name: 'Heraclitus', age: 49 });
// Instead of mutating:
// person.age += 1;  // NO effect
person = { name: 'Heraclitus', age: 50 }; // Correct way to update
```

- Do **NOT** attempt to mutate properties on raw state; instead, reassign the entire object to trigger updates.

### $state.snapshot

- `$state.snapshot` produces a plain object copy of reactive state. For example:

```svelte
<script>
  let counter = $state({ count: 0 });
  function logSnapshot() {
    console.log($state.snapshot(counter));
  }
</script>
```

- **ONLY** use this if you are told there's a problem with passing reactive proxies to external APIs.

### Passing state into functions

- Pass-by-Value Semantics: Use getter functions to ensure functions access the current value of reactive state. For example:
  ```js
  function add(getA, getB) {
  	return () => getA() + getB();
  }
  let a = 1,
  	b = 2;
  let total = add(
  	() => a,
  	() => b
  );
  console.log(total());
  ```
- Do **NOT** assume that passing a reactive state variable directly maintains live updates; instead, pass getter functions.  
  _In Svelte 4, you often used stores with subscribe methods; now prefer getter functions with `$state` / `$derived` instead._

### $derived

- `$derived` computes reactive values based on dependencies. For example:

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
<button onclick={() => count++}>{doubled}</button>
```

- Do **NOT** introduce side effects in derived expressions; instead, keep them pure.  
  _In Svelte 4 you used `$:` for this, e.g. `$: doubled = count * 2;`, now use the $derived rune instead, e.g `let doubled = $derived(count * 2);`._

#### $derived.by

- Use `$derived.by` for multi-line or complex logic. For example:

```svelte
<script>
  let numbers = $state([1, 2, 3]);
  let total = $derived.by(() => {
    let sum = 0;
    for (const n of numbers) sum += n;
    return sum;
  });
</script>
```

- Do **NOT** force complex logic into a single expression; instead, use `$derived.by` to keep code clear.

#### Overriding derived values

- You can reassign a derived value for features like optimistic UI. It will go back to the `$derived` value once an update in its dependencies happen. For example:

```svelte
<script>
  let post = $props().post;
  let likes = $derived(post.likes);
  async function onclick() {
    likes += 1;
    try { await post.like(); } catch { likes -= 1; }
  }
</script>
```

- Do **NOT** try to override derived state via effects; instead, reassign directly when needed.  
  _In Svelte 4 you could use `$:` for that, e.g. `$: likes = post.likes; likes = 1`, now use the `$derived` instead, e.g. `let likes = $derived(post.likes); likes = 1;`._

### $effect

- `$effect` executes functions when reactive state changes. For example:

```svelte
<script>
  let size = $state(50);
  $effect(() => {
    console.log('Size changed:', size);
  });
</script>
```

- Do **NOT** use `$effect` for state synchronization; instead, use it only for side effects like logging or DOM manipulation.  
  _In Svelte 4, you used reactive statements (`$:`) for similar tasks, .e.g `$: console.log(size)`; now use the `$effect` rune instead, e.g. `$effect(() => console.log(size))` ._

#### Understanding lifecycle (for $effect)

- Effects run after the DOM updates and can return teardown functions. For example:

```svelte
<script>
  let count = $state(0);
  $effect(() => {
    const interval = setInterval(() => { count += 1; }, 1000);
    return () => clearInterval(interval);
  });
</script>
```

- **Directive:** Do **NOT** ignore cleanup; instead, always return a teardown function when needed.

#### $effect.pre

- `$effect.pre` works like `$effect` with the only difference that it runs before the DOM updates. For example:

```svelte
<script>
  let div = $state();
  $effect.pre(() => {
    if (div) console.log('Running before DOM update');
  });
</script>
```

- Do **NOT** use `$effect.pre` for standard post-update tasks; instead, reserve it for pre-DOM manipulation like autoscrolling.

#### $effect.tracking

- `$effect.tracking` indicates if code is running inside a reactive context. For example:

```svelte
<script>
  $effect(() => {
    console.log('Inside effect, tracking:', $effect.tracking());
  });
</script>
```

- Do **NOT** misuse tracking information outside its intended debugging context; instead, use it to enhance reactive debugging.  
  _In Svelte 4, no equivalent existed; now this feature offers greater insight into reactivity._

#### $effect.root

- `$effect.root` creates a non-tracked scope for nested effects with manual cleanup. For example:

```svelte
<script>
  let count = $state(0);
  const cleanup = $effect.root(() => {
    $effect(() => {
      console.log('Count is:', count);
    });
    return () => console.log('Root effect cleaned up');
  });
</script>
```

- Do **NOT** expect root effects to auto-cleanup; instead, manage their teardown manually.  
  _In Svelte 4, manual cleanup required explicit lifecycle hooks; now `$effect.root` centralizes this control._

### $props

- Use `$props` to access component inputs. For example:

```svelte
<script>
  let { adjective } = $props();
</script>
<p>This component is {adjective}</p>
```

- Do **NOT** mutate props directly; instead, use callbacks or bindable props to communicate changes.  
  _In Svelte 4, props were declared with `export let foo`; now you use `$props` rune, e.g. `let { foo } = $props()`._
- Declare fallback values via destructuring. For example:

```js
let { adjective = 'happy' } = $props();
```

- Rename props to avoid reserved keywords. For example:

```js
let { super: trouper } = $props();
```

- Use rest syntax to collect all remaining props. For example:

```js
let { a, b, ...others } = $props();
```

#### $props.id()

- Generate a unique ID for the component instance. For example:

```svelte
<script>
  const uid = $props.id();
</script>
<label for="{uid}-firstname">First Name:</label>
<input id="{uid}-firstname" type="text" />
```

- Do **NOT** manually generate or guess IDs; instead, rely on `$props.id()` for consistency.

### $bindable

- Mark props as bindable to allow two-way data flow. For example, in `FancyInput.svelte`:

```svelte
<script>
  let { value = $bindable() } = $props();
</script>
<input bind:value={value} />
```

- Do **NOT** overuse bindable props; instead, default to one-way data flow unless bi-directionality is truly needed.  
  _In Svelte 4, all props were implicitly bindable; in Svelte 5 `$bindable` makes this explicit._

### $host

- Only available inside custom elements. Access the host element for custom event dispatching. For example:

```svelte
<script>
  function dispatch(type) {
    $host().dispatchEvent(new CustomEvent(type));
  }
</script>
<button onclick={() => dispatch('increment')}>Increment</button>
```

- Do **NOT** use this unless you are explicitly tasked to create a custom element using Svelte components

### Using await in Svelte

- **Where you can use await**

  - **Top-level `<script>`**: `await` directly in component script.
  - **Inside `$derived(...)`**.
  - **Inside markup**: inline `await` expressions.

```svelte
<script>
  import { getNumber, isEven, makeDouble } from './number';

  let count = $state(0);
  let double = $derived(await makeDouble(double));
</script>

<button onclick={() => count++}>increment<button>

<p>{await getNumber(count)} * 2 = {double}</p>
{#if await isEven(id)}
  <p>even</p>
{/if}
```

- **Enable the feature**
  - Add `experimental.async: true` to `svelte.config.js`:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

- The flag is experimental in 5.36; it will be removed in Svelte 6.

- **Boundary requirement**
  - You can only use `await` inside a `<svelte:boundary>` that has a `pending` snippet:

```svelte
<svelte:boundary>
	<MyApp />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
```

- Restriction will lift when async SSR is supported.

#### Behavior

- If an `await` depends on state, Svelte defers UI updates that read that state until the async work finishes.
- Fast updates can overtake slow ones; results reflect the latest completed work.
- **Script awaits are normal JS**: sequential unless you parallelize them yourself.
- **$derived awaits**: first run sequentially, then update independently.
- Expect an `await_waterfall` warning if you accidentally serialize independent work.
- Boundary's `pending` snippet shows a loading placeholder while boundary first loads.
- Use `$effect.pending()` to detect ongoing async work.
- Errors from `await` bubble to the nearest `<svelte:boundary>` (acts as an error boundary).

### {#snippet ...}

- **Definition & Usage:**  
  Snippets allow you to define reusable chunks of markup with parameters inside your component.  
  _Example:_
  ```svelte
  {#snippet figure(image)}
    <figure>
      <img src={image.src} alt={image.caption} width={image.width} height={image.height} />
      <figcaption>{image.caption}</figcaption>
    </figure>
  {/snippet}
  ```
- **Parameterization:**  
  Snippets accept multiple parameters with optional defaults and destructuring, but rest parameters are not allowed.  
  _Example with parameters:_
  ```svelte
  {#snippet name(param1, param2)}
    <!-- snippet markup here -->
  {/snippet}
  ```

### Snippet scope

- **Lexical Visibility:**  
  Snippets can be declared anywhere and reference variables from their outer lexical scope, including script or block-level declarations.  
  _Example:_
  ```svelte
  <script>
    let { message = "it's great to see you!" } = $props();
  </script>
  {#snippet hello(name)}
    <p>hello {name}! {message}!</p>
  {/snippet}
  {@render hello('alice')}
  ```
- **Scope Limitations:**  
  Snippets are only accessible within their lexical scope; siblings and child blocks share scope, but nested snippets cannot be rendered outside.  
  _Usage caution:_ Do **NOT** attempt to render a snippet outside its declared scope.

### Passing snippets to components

- **As Props:**  
  Within a template, snippets are first-class values that can be passed to components as props.  
  _Example:_
  ```svelte
  <script>
    import Table from './Table.svelte';
    const fruits = [
      { name: 'apples', qty: 5, price: 2 },
      { name: 'bananas', qty: 10, price: 1 }
    ];
  </script>
  {#snippet header()}
    <th>fruit</th>
    <th>qty</th>
    <th>price</th>
    <th>total</th>
  {/snippet}
  {#snippet row(d)}
    <td>{d.name}</td>
    <td>{d.qty}</td>
    <td>{d.price}</td>
    <td>{d.qty * d.price}</td>
  {/snippet}
  <Table data={fruits} {header} {row} />
  ```
- **Slot-like Behavior:**  
  Snippets declared inside component tags become implicit props (akin to slots) for the component.  
  _Svelte 4 used slots for this, e.g. `<Component><p slot="x" let:y>hi {y}</p></Component>`; now use snippets instead, e.g. `<Component>{#snippet x(y)}<p>hi {y}</p>{/snippet}</Component>`._
- **Content Fallback:**  
  Content not wrapped in a snippet declaration becomes the `children` snippet, rendering as fallback content.  
  _Example:_
  ```svelte
  <!-- App.svelte -->
  <Button>click me</Button>
  <!-- Button.svelte -->
  <script>
    let { children } = $props();
  </script>
  <button>{@render children()}</button>
  ```

### Typing snippets

- Snippets implement the `Snippet` interface, enabling strict type checking in TypeScript or JSDoc.  
  _Example:_

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    data: any[];
    children: Snippet;
    row: Snippet<[any]>;
  }
  let { data, children, row }: Props = $props();
</script>
```

### {@render ...}

- Use the {@render ...} tag to invoke and render a snippet, passing parameters as needed.  
  _Example:_
  ```svelte
  {#snippet sum(a, b)}
    <p>{a} + {b} = {a + b}</p>
  {/snippet}
  {@render sum(1, 2)}
  ```
- Do **NOT** call snippets without parentheses when parameters are required; instead, always invoke the snippet correctly.  
  _In Svelte 4, you used slots for this, e.g. `<slot name="sum" {a} {b} />`; now use `{@render}` instead, e.g. `{@render sum(a,b)}`._

### <svelte:boundary>

- Use error boundary tags to prevent rendering errors in a section from crashing the whole app.
  _Example:_

  ```svelte
  <svelte:boundary onerror={(error, reset) => console.error(error)}>
    <FlakyComponent />
  </svelte:boundary>
  ```

- **Failed Snippet for Fallback UI:**  
  Providing a `failed` snippet renders fallback content when an error occurs and supplies a `reset` function.  
  _Example:_

  ```svelte
  <svelte:boundary>
    <FlakyComponent />
    {#snippet failed(error, reset)}
      <button onclick={reset}>Oops! Try again</button>
    {/snippet}
  </svelte:boundary>
  ```

### class

- Svelte 5 allows objects for conditional class assignment using truthy keys. It closely follows the `clsx` syntax  
  _Example:_

```svelte
<script>
  let { cool } = $props();
</script>
<div class={{ cool, lame: !cool }}>Content</div>
```
