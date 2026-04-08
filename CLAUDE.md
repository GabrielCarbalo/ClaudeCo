# ClaudeCo — Project Context for Claude

## What This Is

A TypeScript-first pnpm monorepo for Windows-native development. Serves as both a real
product codebase and a base template for modern fullstack projects.

## Architecture

```
apps/
  web/      React 19 + Vite 6 + Tailwind CSS v4 + TypeScript strict
  api/      Fastify 5 + Zod + TypeScript strict
packages/
  shared/   TypeScript types only — exported as source (.ts), no build step
```

`@claudeco/shared` exports raw TypeScript (`"exports": { ".": "./src/index.ts" }`).
Apps import it as `workspace:*`. No compilation needed — Vite and tsx handle it at runtime.

## TypeScript

- Strict mode is on. No `any` without an inline comment explaining why.
- Use `type` for data shapes, `interface` only when you need declaration merging or class implementation.
- Use `import type` for type-only imports — required by `isolatedModules`.
- Explicit return types on all exported functions.
- Prefer `unknown` over `any` when the shape is truly unknown; narrow with type guards.
- No non-null assertions (`!`) — use explicit null checks or early returns instead.

```ts
// Bad
const el = document.getElementById('root')!

// Good
const el = document.getElementById('root')
if (!el) throw new Error('#root not found')
```

## React (apps/web)

- Components are plain functions. No class components.
- Local state first. Don't lift state until two sibling components genuinely need it.
- Do not use `useEffect` to derive state — compute inline or with `useMemo`.
- CSS via Tailwind utility classes. No inline styles, no CSS modules.
- Tailwind v4: configured via `@import "tailwindcss"` in `index.css`, no `tailwind.config.js`.
- Test components with `@testing-library/react` — test behavior, not implementation.

```tsx
// Bad — useEffect for derived state
const [fullName, setFullName] = useState('')
useEffect(() => setFullName(`${first} ${last}`), [first, last])

// Good
const fullName = `${first} ${last}`
```

## API (apps/api)

- Fastify 5 with TypeScript generics for request/reply types.
- Always declare the `Reply` generic on routes that return data.
- Validate all external input with Zod. Never trust `request.body` without a schema.
- Shared response types live in `packages/shared`. Use them — don't duplicate.
- CORS is configured for `http://localhost:3000` in dev. Add origins explicitly.
- Entry point is `src/index.ts`. Dev via `tsx watch`, prod via compiled `dist/index.js`.

```ts
// Route pattern
app.get<{ Reply: HealthResponse }>('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})
```

## Environment Variables (apps/api)

- Never hardcode secrets, tokens, or credentials in source code.
- Read all sensitive values from `process.env`. Validate at startup — fail fast if a required
  variable is missing so the error surfaces immediately, not at the call site.
- Document every variable in `apps/api/.env.example` with a safe placeholder value.

```ts
// Bad — hardcoded secret, silent failure if undefined
const secret = 'sk-proj-xxxxx'
const port = process.env.PORT // silently undefined in some envs

// Good — explicit validation at startup boundary
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('JWT_SECRET is required')

const PORT = Number(process.env.PORT) || 3001
```

## Shared Package (packages/shared)

- This package contains types only. No runtime logic, no side effects.
- Add types here when more than one app needs the same shape.
- Do not add `@claudeco/shared` as a dependency to itself.
- Exports: `ApiResponse<T>`, `HealthResponse`, `PaginatedResponse<T>`.

## Monorepo Conventions

- Run all scripts from the repo root via pnpm workspace commands.
- `pnpm --filter @claudeco/web <script>` to target a specific app.
- Never `cd` into a package to run scripts — use filters.
- New shared types → `packages/shared/src/types.ts`.
- Cross-package imports: only `@claudeco/shared`. Apps do not import from each other.

## Linting and Formatting

- **Biome 2.4.10** handles both linting and formatting. No ESLint, no Prettier.
- Single quotes, no semicolons, 2-space indent, 100 char line width, LF endings.
- `pnpm lint` — check only. `pnpm lint:fix` — auto-fix.
- Biome runs automatically on staged files via `lint-staged` before every commit.
- Do not add ESLint or Prettier configs — they conflict with Biome.

## Testing

- **Vitest 3** with `globals: true`. Use `describe/it/expect` without imports in test files.
- **Exception**: `apps/api` does import from `vitest` explicitly.
- Testing Library for React components (`@testing-library/react`).
- Test behavior, not internal state. Prefer `screen.getByRole` over `getByTestId`.
- Test files: `src/**/*.test.ts(x)`. Setup file: `apps/web/src/test/setup.ts`.
- Run: `pnpm test` (all workspaces) or `pnpm --filter @claudeco/web test`.

## Git and Commits

- Conventional commits enforced by commitlint: `feat:`, `fix:`, `chore:`, `test:`, `refactor:`, etc.
- Husky runs `lint-staged` on pre-commit and `commitlint` on commit-msg.
- `pnpm-lock.yaml` must be committed whenever dependencies change.
- Branch naming: `feature/`, `fix/`, `chore/` prefixes.

## Available Scripts (root)

```
pnpm dev          Start web (:3000) and api (:3001) in parallel
pnpm build        Build all apps
pnpm test         Run all tests across workspaces
pnpm lint         Biome check (read-only)
pnpm lint:fix     Biome check with auto-fix
pnpm format       Biome format with write
```

## CI Pipeline

GitHub Actions on push to `main` and `claude/**` branches, and on PRs to `main`.
Steps in order: install → typecheck → lint → test → build.
pnpm version comes from `packageManager` in `package.json` — do not hardcode it in CI.

## Infrastructure (Docker)

```
docker compose up -d   Start PostgreSQL 17 (:5432) and Redis 7 (:6379)
```

Credentials: `claudeco / claudeco`. Connection string in `apps/api/.env.example`.
Do not commit `.env` files — only `.env.example`.

## What Not to Do

- Do not add `"type": "module"` selectively to sub-packages — it is already set per package.
- Do not use `require()` — this is ESM throughout.
- Do not run `tsc --build` on `apps/web` — Vite handles compilation. Use `vite build`.
- Do not add global ESLint or Prettier configs — Biome covers both.
- Do not put runtime code in `packages/shared` — types only.
- Do not add `node_modules` to git — `.gitignore` covers it but double-check.
- Do not skip `pnpm-lock.yaml` in commits after dependency changes.
