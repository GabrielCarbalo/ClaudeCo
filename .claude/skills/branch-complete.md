---
name: branch-complete
description: >
  Checklist to run before pushing a branch or creating a PR.
  Verifies that code quality gates pass, nothing is left incomplete,
  and the branch is in a clean state for review or merge.
---

# Branch Complete

Run this checklist before declaring a branch done. Go through it top to bottom.
Do not skip items — each one catches a different category of problem.

## 1. Code quality

```bash
pnpm lint          # Biome check — must pass with 0 errors
pnpm test          # All workspaces — must pass with 0 failures
```

If `pnpm -r --if-present typecheck` is available:
```bash
pnpm -r --if-present typecheck   # TypeScript — no errors
```

All three must be green before continuing.

## 2. Completeness

- [ ] No `// TODO` or `// FIXME` left in any changed file
- [ ] No `console.log` or debug output left in production code
- [ ] All new Fastify routes have Zod validation for inputs
- [ ] All new shared types are exported from `packages/shared/src/index.ts`
- [ ] New behaviors have at least one test

## 3. Dependencies and lockfile

- [ ] If any package was added or removed: `pnpm-lock.yaml` is updated and staged
- [ ] No unintended packages were added (check `git diff package.json`)
- [ ] No duplicate packages between `apps/web`, `apps/api`, and `packages/shared`

## 4. Environment and configuration

- [ ] If new environment variables were added: `.env.example` is updated in the relevant app
- [ ] No `.env` files are staged — only `.env.example`
- [ ] No secrets, tokens, or credentials in any committed file

## 5. Git state

```bash
git status         # Should show only intentional changes
git diff --cached  # Review staged diff before committing
```

- [ ] No untracked files that should be committed
- [ ] No generated files committed (`dist/`, `*.tsbuildinfo`, `node_modules/`)
- [ ] Commit messages follow conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `refactor:`
- [ ] Branch is up to date with its base branch

## 6. CI compatibility

- [ ] Changes do not modify `.github/workflows/ci.yml` unintentionally
- [ ] If CI was modified: pnpm version still comes from `packageManager` in `package.json`
- [ ] The build would pass: `pnpm build` completes without errors (verify locally if in doubt)

## Done

When all items are checked, the branch is ready.
If items cannot be checked because they are out of scope, note it explicitly in the PR description.
