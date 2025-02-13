---
title: <svelte:html>
---

The `<svelte:html>` element allows you to listen to events _and_ set attributes on the `<html>`. This is useful to for example set the `lang` tag dynamically, or to update `class`es that influence the whole page.

Add a conditional `class` attribute to the `<svelte:html>` tag...

```svelte
<!--- file: App.svelte --->
<svelte:html
	+++class={darkmode ? 'dark' : 'light'}+++
/>
```

...and click the button to toggle the mode.
