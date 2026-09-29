# Edusphere Africa

Mobile-first opportunity discovery for African students, graduates and young professionals. Built with Next.js App Router, PostgreSQL and Drizzle ORM.

## Launch on Vercel

**The public site will build and load even without a database.** It then displays the 23 committed, read-only example listings and clearly labels them as examples. Deadlines should always be confirmed on the original provider's website. Admin publishing, newsletter subscriptions and online messages need persistent storage and won't silently claim success in this mode.

To launch the complete, persistent platform:

1. Create a hosted PostgreSQL database in [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Marketplace. Copy its **pooled connection string** with SSL enabled. `127.0.0.1` / `localhost` only works on your own computer, not on Vercel.
2. In **Vercel → your project → Settings → Environment Variables**, add `DATABASE_URL` (or `POSTGRES_URL`) with that connection string. Select **Production** and **Preview**, then **redeploy**. Vercel does not read the local `.env` file.
3. For admin access, set `ADMIN_PASSWORD` and `ADMIN_RECOVERY_ANSWER` there too. These are used only when creating the first admin account; subsequent redeploys do not replace a password you have changed in the dashboard. The username defaults to `admin`.
4. This project's `vercel.json` automatically runs `scripts/setup-deploy.mjs` during build. If a hosted database is reachable, it applies the Drizzle schema and inserts missing example listings **without deleting existing subscribers, messages or admin-published entries**. No migration command needs to be run manually. If the connection is unavailable, the build still deploys the public site in example mode; read the deployment build logs for the database warning.
5. Visit `/api/health`. `{"mode":"connected","storage":true}` means the database is working; `{"mode":"demo","database":"not-configured","storage":false}` means only the read-only public site is available. A 503 with `database:"unavailable-or-not-migrated"` means a connection URL was provided but its host, credentials or schema needs attention.

> **Important:** A deployment without `DATABASE_URL` or `POSTGRES_URL` cannot persist subscriber emails, contact submissions or admin opportunities. No app can make a database appear in Vercel automatically; attach a managed PostgreSQL database to enable those features. The error page shown on previous deployments came from public pages querying an absent database. The public pages now have a committed fallback and do not crash.

## Local development

Create `.env` based on `.env.example` with a real local or managed `DATABASE_URL`. Then:

```bash
npm install
npx drizzle-kit push
node scripts/seed-once.mjs
npm run dev
```

`seed-once.mjs` uses Drizzle inserts with `ON CONFLICT DO NOTHING`; it is safe to rerun. `scripts/seed.mjs` is now a backward-compatible alias to the same safe script.

To verify that Vercel's public-site fallback works without `.env`, run `npm run build` and start the production server with database variables unset. You can browse all public routes, search and article details. Admin and form writes return explicit storage errors until Postgres is connected.

## Community and contact

Links and email are kept in `src/lib/site.ts`. The WhatsApp group, WhatsApp channel, X account and contact email are displayed throughout the website.
