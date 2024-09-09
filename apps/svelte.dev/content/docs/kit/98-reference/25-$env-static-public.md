---
title: $env/static/public
---

Similar to [`$env/static/private`](/docs/kit/reference/$env-all#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](/docs/kit/reference/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.

Values are replaced statically at build time.

```ts
import { PUBLIC_BASE_URL } from '$env/static/public';
```



