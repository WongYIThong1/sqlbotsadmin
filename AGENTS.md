# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Next.js App Router pages: `dashboard`, `user`, `license`, `version`, `logs`, `security-logs`, `team-manage`, `login`; API handlers live under `app/api/*` for auth and license CRUD. `middleware.ts` gates protected routes.
- `components/` contains shared UI (sidebar, charts, ProtectedRoute) plus `components/ui/` design-system primitives.
- `lib/` holds server helpers: `auth.ts` (JWT + Supabase session handling), `license.ts` (license utilities), `utils.ts`.
- `public/` keeps static assets; `app/globals.css` and `styles/` provide Tailwind/global styling.

## Build, Test, and Development Commands
- `npm install` — install dependencies (uses `package-lock.json`).
- `npm run dev` — start Next.js dev server with HMR at http://localhost:3000.
- `npm run lint` — ESLint (Next/Tailwind); run before pushing.
- `npm run build` — production build; fails on TypeScript/route issues (strict mode on).
- `npm start` — serve the built `.next` output; mirrors production behavior.

## Coding Style & Naming Conventions
- TypeScript + React 19 on Next.js App Router; keep components server-first unless client hooks are needed.
- 2-space indentation, double quotes, and grouped imports (libs -> components -> relative).
- Components and exported functions in PascalCase; files kebab-case (e.g., `activity-chart.tsx`).
- Prefer Tailwind utility classes over inline styles; reuse `components/ui` primitives before creating new ones.
- Path alias `@/*` resolves to repo root for imports.

## Testing Guidelines
- No automated tests yet; place future tests as `*.test.ts`/`*.spec.ts` near code.
- Current baseline: run `npm run lint`, `npm run build`, and manually verify login plus license CRUD flows in `/dashboard` and `/license`.
- Goal: add request/response validation tests for auth and license APIs (`lib/auth.ts`, `app/api/licenses`).

## Commit & Pull Request Guidelines
- Match existing history: short, imperative subjects (e.g., "Fix license patch auth").
- Add body notes when touching auth/secrets (env var expectations, Supabase behavior); reference issues when applicable.
- PRs should state scope, commands executed, env changes required, and include screenshots/GIFs for UI updates.
- Keep diffs focused; avoid formatting-only churn.

## Security & Configuration Tips
- Secrets stay in `.env.local` and hosting env; never commit or log `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET`.
- API routes assume server-only Supabase credentials; do not shift those calls into client components.
- For public Supabase access, use separate `NEXT_PUBLIC_*` keys and keep the service role server-side only.
