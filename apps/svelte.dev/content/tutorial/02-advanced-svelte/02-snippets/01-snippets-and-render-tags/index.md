---
title: Snippets and render tags
---

Snippets allow you to reuse content within a component, without extracting it out into a separate file.

In this exercise, we're creating a table of the [three wise monkeys](https://en.wikipedia.org/wiki/Three_wise_monkeys), along with their unicode escape sequences and HTML entities. So far, we have but a single monkey.

We could duplicate the markup, of course. Or we could create an array of `{ emoji, description }` objects and pass it into an `{#each ...}` block. But a neater solution is to encapsulate the markup in a reusable block.

Begin by _declaring a snippet_:

```svelte
/// file: App.svelte
+++{#snippet monkey()}+++
	<tr>
		<td>{emoji}</td>
		<td>{description}</td>
		<td>\u{emoji.charCodeAt(0).toString(16)}\u{emoji.charCodeAt(1).toString(16)}</td>
		<td>&amp#{emoji.codePointAt(0)}</td>
	</tr>
+++{/snippet}+++
```

The monkey is no longer visible until we _render_ it. Let's do that:

```svelte
/// file: App.svelte
<tbody>
	{#snippet monkey()}...{/snippet}

	+++{@render monkey()}+++
</tbody>
```

Before we can use the snippet for the rest of our monkeys, we need to pass data into the snippet. Snippets can have zero or more parameters:

```svelte
/// file: App.svelte
<tbody>
	+++{#snippet monkey(emoji, description)}...{/snippet}+++

	+++{@render monkey('🙈', 'see no evil')}+++
</tbody>
```

> [!NOTE] You can also use destructured parameters, if you like.

Add the rest of the monkeys:

- `'🙈', 'see no evil'`
- `'🙉', 'hear no evil'`
- `'🙊', 'speak no evil'`

Finally, delete the `<script>` block we no longer need it:

```svelte
/// file: App.svelte
---<script>
	let emoji = '🙈';
	let description = 'see no evil';
</script>---
```

> [!NOTE] Snippets can be declared anywhere in your component, but, like functions, are only visible to render tags in the same 'scope' or a child scope.
