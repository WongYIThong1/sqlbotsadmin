# Project Status

## Current focus
- Harden auth and data access (service role key, no client exposure).
- Restore readable docs and enforce TypeScript checks.
- Complete license detail API for CRUD readiness.

## Outstanding risks / TODO
- Supply `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and hosting environment.
- Verify Supabase RLS and RPC security: ensure only intended roles can call `verify_admin_credentials`, `get_licenses`, `insert_licenses`, `licenses` table updates.
- Run `npm run lint` and `npm run build` after turning off `ignoreBuildErrors`; fix any remaining TS errors.

## Recent changes (today)
- Switched API routes to server-only Supabase credentials (service role).
- Removed hardcoded secrets/defaults; JWT now requires provided secret.
- Added `/api/licenses/[id]` GET & PATCH for per-license reads/updates.
- Cleaned sensitive logging in auth flow; enabled TypeScript build enforcement.
- Rewrote env docs for clarity.

## Next steps
1) Plug in real service role key and redeploy.
2) Add API input validation tests for auth and licenses.
3) Consider rate limiting and audit logging for admin endpoints.
