# Random Prediction – Next.js Edition

This directory contains a full Next.js reimplementation of the Streamlit random prediction game. The experience mirrors the original features while introducing a new dial-based selector and foundations for a proper authentication flow.

## Getting started

1. Install dependencies
   ```bash
   pnpm install
   # or npm install / yarn install
   ```
2. Provide the required environment variables in `.env.local` (see below).
3. Run the development server
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to play the game.

## Environment variables

Create `nextjs-app/.env.local` with the following entries:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RANDOM_API_KEY=...
```

- `SUPABASE_SERVICE_ROLE_KEY` (or using the existing `SUPABASE_SECRET_KEY`) is required because the app performs server-side inserts and analytics queries.
- `RANDOM_API_KEY` is the Random.org key already used by the Streamlit version.

## Project structure

- `app/(pages)/game` – main game with the snipping wheel dial, leaderboard, and game flow.
- `app/(pages)/analytics` – global analytics, heatmaps, and community insights.
- `app/(pages)/my-analytics` – personal analytics powered by email lookups.
- `app/api/*` – serverless routes that handle Random.org calls and Supabase persistence.
- `lib/` – shared analytics helpers and Supabase admin client.
- `app/hooks/useSavedIdentity.ts` – temporary identity cache (localStorage) until the dedicated login/register flow ships.

## Dial & UI

The new “snipping wheel” dial lets players spin through numbers and lock in 10 unique picks. The layout was designed to mirror the Streamlit phases:

1. Spin & lock numbers.
2. Share name/email before viewing results.
3. Explore results, matches, and quick links to analytics.

## Authentication roadmap

This migration keeps identity lightweight for now. The `useSavedIdentity` hook stores name/email locally so repeat players are auto-filled. The API layer lives server-side, making the transition to Supabase Auth (or any provider) straightforward when we add the login/register journey.

## Testing & next steps

- Run `pnpm lint` before deploying.
- Consider adding unit tests for the analytics helpers in `lib/analytics.ts`.
- When the authentication work begins, replace the local identity hook with a full auth context and secure Supabase policies.

Enjoy the new experience! 🎯
