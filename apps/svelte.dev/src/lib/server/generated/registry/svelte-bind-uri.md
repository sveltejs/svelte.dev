---
name: "svelte-bind-uri"
description: """```html
<script lang="ts">
	import { Location } from 'svelte-uri'

	let searchParams = {
		keys: ["a", "b"] // &keys=a&keys=b
		key: "c" // & key=c
	}
	let hash = "test" // #test
	let protocol: http // http:
	let host: string // localhost
	let port: number // 3000
</script>
<Location
	bind:searchParams="{searchParams}"
	bind:hash="{hash}"
	bind:protocol="{protocol}"
	bind:host="{host}"
	bind:port="{port}"
	bind:hostname="{hostname}"
	bind:pathname="{pathname}"
	href="{href}"
	origin="{origin}"
	username="{username}"
	password="{password}"
/>
```"""
author: "7korobi"
homepage: "https://github.com/7korobi/svelte-bind-uri/blob/main/src/lib/"
updated: "2022-11-05T17:25:12.916Z"
tags: 
  - utility
---
