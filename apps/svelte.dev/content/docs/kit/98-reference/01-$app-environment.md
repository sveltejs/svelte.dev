---
title: $app/environment
---

<!-- @include_start $app/environment -->


## browser

```typescript
const browser: boolean;
```

`true` if the app is running in the browser.

## building

```typescript
const building: boolean;
```

SvelteKit analyses your app during the `build` step by running it. During this process, `building` is `true`. This also applies during prerendering.

## dev

```typescript
const dev: boolean;
```

Whether the dev server is running. This is not guaranteed to correspond to `NODE_ENV` or `MODE`.

## version

```typescript
const version: string;
```

The value of `config.kit.version.name`.


<!-- @include_end $app/environment -->
