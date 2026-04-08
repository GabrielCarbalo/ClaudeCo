---
name: plan
description: >
  Creates a structured implementation plan before writing any code.
  Use at the start of any non-trivial task to define scope, affected files,
  risks, and ordered steps. Prevents scope creep and identifies blockers early.
---

# Plan

Before implementing anything, build a clear plan. This skill applies to any task
that touches more than one file, introduces a new pattern, or has uncertain scope.

## Steps

**1. Restate the goal**
In one sentence: what is the outcome, not the implementation.

**2. Locate affected areas**
Which packages are involved?
- `apps/web` — React components, routing, state, Tailwind styling
- `apps/api` — Fastify routes, middleware, validation schemas
- `packages/shared` — Shared TypeScript types

Which specific files will change? List them. Read them before continuing.

**3. Identify constraints**
- Does this require a new npm dependency? (Requires explicit user approval.)
- Does this change a shared type in `packages/shared`? (Both apps may be affected.)
- Does this touch the CI pipeline or `pnpm-lock.yaml`? (Higher risk — note it.)
- Does this change public API shape or component props? (Breaking change — flag it.)

**4. List ordered steps**
Number each concrete action. Keep steps atomic — one change per step.

Example format:
```
1. Add `UserProfile` interface to `packages/shared/src/types.ts`
2. Create `apps/api/src/routes/user.ts` with GET /api/users/:id
3. Add Zod schema for request params validation
4. Create `apps/web/src/components/UserCard.tsx`
5. Add test for UserCard in `apps/web/src/components/UserCard.test.tsx`
6. Add test for the API route in `apps/api/src/routes/user.test.ts`
```

**5. Define done**
What does success look like?
- `pnpm test` passes
- `pnpm lint` passes with 0 errors
- The feature works in the browser / API responds correctly
- Any new types are exported from `packages/shared`

## Output format

Present the plan as a numbered list under each section heading.
Keep it short. If a step is unclear, flag it explicitly — do not assume.

Once the plan is ready, pause and confirm with the user before proceeding to implementation.
