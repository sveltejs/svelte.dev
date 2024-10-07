---
title: Spread props
---

In this exercise, we've forgotten to pass the `name` prop expected by `PackageInfo.svelte`, meaning the `<code>` element is empty and the npm link is broken.

We _could_ fix it by adding the prop...

```svelte
/// file: App.svelte
<PackageInfo
	+++name={pkg.name}+++
	version={pkg.version}
	description={pkg.description}
	website={pkg.website}
/>
```

...but since the properties of `pkg` correspond to the component's expected props, we can 'spread' them onto the component instead:

```svelte
/// file: App.svelte
<PackageInfo +++{...pkg}+++ />
```

> Conversely, you can get an object containing all the props that were passed into a component using a rest property...
>
> ```js
> let { name, ...stuff } = $props();
> ```
>
> ...or by skipping [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) altogether:
>
> ```js
> let stuff = $props();
> ```
