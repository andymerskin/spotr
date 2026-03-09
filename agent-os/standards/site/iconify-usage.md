# Iconify Icon Usage

Use Iconify icon sets exclusively. Never paste inline SVGs or import `.svg` files.

## Icon Sets

- **Logos**: `@iconify-json/logos` → `logos:react`, `logos:vue`, `logos:svelte`, `logos:solidjs`, `logos:preact`, `logos:github`, etc.
- **All other icons**: `@iconify-json/solar` → `solar:magnifer-linear`, `solar:close-circle-linear`, `solar:check-circle-linear`, etc.

## Framework Usage

### Astro

```astro
---
import { Icon } from 'astro-icon/components';
---

<Icon name="logos:react" />
<Icon name="solar:magnifer-linear" />
```

### React

```tsx
import { Icon } from '@iconify/react';

<Icon icon="logos:react" />
<Icon icon="solar:magnifer-linear" />
```

## Rules

- **Never** paste inline SVGs
- **Never** import `.svg` files
- Use `logos:*` for framework/library logos
- Use `solar:*` for all other icons (UI, actions, etc.)
