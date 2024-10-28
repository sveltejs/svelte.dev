### binding_property_non_reactive

```
`%binding%` is binding to a non-reactive property
```

```
`%binding%` (%location%) is binding to a non-reactive property
```

### console_log_state

```
Your `console.%method%` contained `$state` proxies. Consider using `$inspect(...)` or `$state.snapshot(...)` instead
```

When logging a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), browser devtools will log the proxy itself rather than the value it represents. In the case of Svelte, the 'target' of a `$state` proxy might not resemble its current value, which can be confusing.

The easiest way to log a value as it changes over time is to use the [`$inspect`](https://svelte.dev/docs/svelte/$inspect) rune. Alternatively, to log things on a one-off basis (for example, inside an event handler) you can use [`$state.snapshot`](https://svelte.dev/docs/svelte/$state#$state.snapshot) to take a snapshot of the current value.

### event_handler_invalid

```
%handler% should be a function. Did you mean to %suggestion%?
```

### hydration_attribute_changed

```
The `%attribute%` attribute on `%html%` changed its value between server and client renders. The client value, `%value%`, will be ignored in favour of the server value
```

### hydration_html_changed

```
The value of an `{@html ...}` block changed between server and client renders. The client value will be ignored in favour of the server value
```

```
The value of an `{@html ...}` block %location% changed between server and client renders. The client value will be ignored in favour of the server value
```

### hydration_mismatch

```
Hydration failed because the initial UI does not match what was rendered on the server
```

```
Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
```

### invalid_raw_snippet_render

```
The `render` function passed to `createRawSnippet` should return HTML for a single element
```

### legacy_recursive_reactive_block

```
Detected a migrated `$:` reactive block in `%filename%` that both accesses and updates the same reactive value. This may cause recursive updates when converted to an `$effect`.
```

### lifecycle_double_unmount

```
Tried to unmount a component that was not mounted
```

### ownership_invalid_binding

```
%parent% passed a value to %child% with `bind:`, but the value is owned by %owner%. Consider creating a binding between %owner% and %parent%
```

### ownership_invalid_mutation

```
Mutating a value outside the component that created it is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead
```

```
%component% mutated a value owned by %owner%. This is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead
```

### state_proxy_equality_mismatch

```
Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `%operator%` will produce unexpected results
```

`$state(...)` creates a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the value it is passed. The proxy and the value have different identities, meaning equality checks will always return `false`:

```svelte
<script>
	let value = { foo: 'bar' };
	let proxy = $state(value);

	value === proxy; // always false
</script>
```

To resolve this, ensure you're comparing values where both values were created with `$state(...)`, or neither were. Note that `$state.raw(...)` will _not_ create a state proxy.
