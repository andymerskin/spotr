# TypeScript Code Conventions

## Configuration

- Strict mode, ES2022, ESM (`type: "module"`)

## Naming Conventions

- **Classes**: `PascalCase` — `class Spotr`, `class SpotrError`
- **Functions**: `camelCase` — `function query()`, `function shallowEqual()`
- **Types**: `PascalCase` — `type SpotrOptions`, `interface FieldConfig`
- **Constants**: `UPPER_SNAKE_CASE` — `const MAX_STRING_LENGTH`, `const ErrorCodes`
- **Private properties**: `_prefix` — `private _collection`, `private _options`

## Type Definitions

Prefer `@types/*` packages over custom `.d.ts` files for external libraries:

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

Reference in `tsconfig.json` `types` array if needed.

## Exports

- **Prefer named exports**: `export function query()`, `export class Spotr`
- **Use `import type`** for type-only imports: `import type { SpotrOptions } from 'spotr'`

```typescript
// Good
export function createSpotr() { }
export type SpotrResult = { ... };

import type { SpotrOptions } from 'spotr';

// Avoid
export default class Spotr { }
import SpotrOptions from 'spotr';
```
