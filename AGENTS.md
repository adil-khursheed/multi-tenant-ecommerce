# Multi-Tenant Ecommerce Monorepo

## Structure

```
apps/
  web/       — Next.js 16 + Payload CMS 3 + MongoDB + tRPC (the main app)
  mobile/    — Expo 56 + React Native (early stage)
packages/
  api/       — tRPC routers shared between web and mobile (@repo/api)
  payments/  — Razorpay + COD adapters (@repo/payments)
  types/     — Shared TS types (@repo/types)
  validators/— Zod schemas (@repo/validators)
  eslint-config/    — shared ESLint config
  typescript-config/— shared tsconfig bases
```

Both apps consume `@repo/api`, `@repo/payments`, `@repo/types`, `@repo/validators` via `workspace:*`.

## Commands

All commands run from repo root via Turbo unless noted.

```bash
pnpm dev              # watch mode — builds types first, then runs all apps
pnpm dev:web          # web app only
pnpm dev:mobile       # mobile app only
pnpm build            # production build (all apps)
pnpm lint             # eslint (all apps)
pnpm typecheck        # tsc --noEmit (all apps)
pnpm generate:types   # Payload codegen → apps/web/src/payload-types.ts
pnpm format           # prettier write
```

**Verification order**: `generate:types` → `lint` → `typecheck` → `test`

### Per-app commands (run from apps/web)

```bash
pnpm test             # runs int + e2e sequentially
pnpm test:int         # vitest — tests/int/**/*.int.spec.ts
pnpm test:e2e         # playwright — tests/e2e/**/*.spec.ts (starts dev server)
pnpm payload <cmd>    # Payload CLI (migrate, generate:types, etc.)
pnpm generate:importmap  # regenerate admin import map after component changes
pnpm db:fresh         # drop and recreate DB
pnpm db:seed          # seed via tsx script
```

### Mobile (run from apps/mobile)

```bash
pnpm start            # expo start -c
```

## Web App — Key Facts

### Payload CMS Config

- Config: `apps/web/src/payload.config.ts`
- Uses **MongoDB** via `@payloadcms/db-mongodb`
- `@payload-config` tsconfig alias → `./src/payload.config.ts`
- Auto-generated types: `src/payload-types.ts` — never edit by hand

### Plugins (apps/web/src/plugins/index.ts)

- `@payloadcms/plugin-ecommerce` — products, orders, carts, variants (INR/Razorpay)
- `@payloadcms/plugin-multi-tenant` — tenant isolation for products, orders, variants
- `@payloadcms/plugin-seo`, `@payloadcms/plugin-form-builder`
- `@payloadcms/storage-vercel-blob` — media storage
- Payments: Razorpay adapter + COD adapter from `@repo/payments`

### Environment

- Validated at build/start via `@t3-oss/env-nextjs` (see `src/env.ts`)
- `.env.example` at `apps/web/.env.example` — copy to `apps/web/.env`
- **`env.ts` is the source of truth** for required vars — `.env.example` is incomplete
- Required: `PAYLOAD_SECRET`, `DATABASE_URL`, Razorpay keys, SMTP, Firebase, `ENCRYPTION_KEY`, Vercel Blob token
- Env validation is skipped during `lint` lifecycle and in CI

### Important Patterns

- All web scripts use `cross-env NODE_OPTIONS=--no-deprecation` prefix
- Dev server runs with `--no-server-fast-refresh`
- Next.js caching is **disabled** (`force-dynamic`, `no-store`) by default for Payload Cloud
- Payload admin components use **path-based imports** (not direct imports) with `#NamedExport` suffix
- Run `pnpm generate:importmap` after creating/modifying admin panel components
- Job queues: `default` (5 min), `vendor-onboarding` (2 min), `emails` (1 min)
- Tenant activation triggers Razorpay onboarding workflow automatically via `afterChange` hook

### Testing

- **Integration** (Vitest): `tests/int/` — uses jsdom, loads `.env` via dotenv
- **E2E** (Playwright): `tests/e2e/` — chromium only, starts dev server at `localhost:3000`
- Playwright retries 1x locally, 3x on CI; fails build if `test.only` left in source
- Test helpers: `tests/helpers/login.ts`, `tests/helpers/seedUser.ts`

### Collections

Core: Users, Pages, Media, Categories, Reviews
Ecommerce (via plugin): Products, Variants, VariantTypes, VariantOptions, Orders, Carts, Transactions
Multi-tenant: Tenants, Collections, Designs, Materials, Commissions

## Mobile App — Key Facts

- Expo 56 (docs: https://docs.expo.dev/versions/v56.0.0/)
- Entry: `src/app/_layout.tsx` → wraps everything in `TRPCReactProvider`
- Uses `expo-router` for file-based routing
- Typed routes enabled (`experiments.typedRoutes: true`)
- React Compiler enabled (`experiments.reactCompiler: true`)

## Sub-App Instruction Files

- `apps/web/AGENTS.md` — Payload CMS patterns and security rules (comprehensive reference)
- `apps/web/CLAUDE.md` — warns about Next.js breaking changes vs training data
- `apps/mobile/AGENTS.md` — points to Expo v56 docs

## Gotchas

- **Payload Local API bypasses access control by default** — always pass `overrideAccess: false` when a `user` is provided
- **Always pass `req` to nested Payload operations in hooks** — otherwise they run in separate transactions
- **`generate:types` must run after any schema change** — `payload-types.ts` goes stale
- **`generate:importmap` must run after adding/modifying Payload admin components**
- **Bank details in Tenants are encrypted** — `encryptField`/`decryptField` in `src/lib/crypto.ts`, masked as dots for non-admin users
- **No pre-commit hooks** configured — lint/typecheck/test must be run manually
- **Next.js 16 has breaking changes** vs training data — read `node_modules/next/dist/docs/` before writing Next.js code
