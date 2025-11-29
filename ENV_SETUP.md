# Environment Setup

Use a local `.env.local` file (already gitignored) for secrets. Do not commit secrets to the repo or paste them in issue trackers.

## Required variables
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=32+ random hex characters
JWT_EXPIRES_IN=24h
```

### Generate a secure JWT secret
- PowerShell: `[BitConverter]::ToString([byte[]](1..32 | ForEach-Object {Get-Random -Max 256})).Replace('-','')`
- Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Notes
- `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** key; never expose it to the client.
- If you need client-side access to public Supabase data, create separate `NEXT_PUBLIC_*` keys, but server routes here should keep using the service role key.
- `JWT_EXPIRES_IN` accepts `s`, `m`, `h`, or `d` suffixes (e.g., `24h`, `7d`).

### Quick start
1) Create `.env.local` with the variables above.
2) Install deps: `npm install`.
3) Run dev server: `npm run dev`.
4) Update Vercel/host env vars to match production.
