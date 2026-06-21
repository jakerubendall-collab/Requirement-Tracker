# ListingRoom — Williams Roth Group

A private seller-client portal for the Williams Roth Group, Lee & Associates San Diego.
Brokers manage industrial listings, review AI-drafted weekly updates, and track every buyer
and tenant in one place. Seller clients get a clean, read-only view of their property.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and configure
cp .env.example .env.local
# Edit .env.local — DATABASE_URL is already set for local SQLite

# 3. Set up the database
npx prisma db push

# 4. Seed with demo data (San Diego industrial listings)
npm run seed

# 5. Run locally
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/login`.

## Dev Bypass Logins

On the login page, use the **Dev bypass** buttons (no email required):

| Role   | Email                        | Properties |
|--------|------------------------------|------------|
| Broker | broker@williamsroth.com      | All 4 listings |
| Seller | seller@example.com           | Miramar Distribution Center + National City Industrial |
| Seller | seller2@example.com          | Kearny Mesa Flex/Industrial |
| Seller | seller3@example.com          | Otay Mesa Logistics Hub |

Or use the direct links:
- **Broker**: http://localhost:3000/api/dev-login?role=BROKER
- **Seller**: http://localhost:3000/api/dev-login?role=SELLER

## AI Weekly Updates

1. As Broker, open any listing → click **"Generate update"**
2. The AI reads all SourceSignals + structured data for that property
3. Edit the final text → **"Publish to client"**
4. The seller client's dashboard updates immediately

**With Anthropic API key** (`ANTHROPIC_API_KEY` in `.env.local`): uses `claude-opus-4-8` for live AI drafts.  
**Without**: falls back to a deterministic templated generator — the demo always works offline.

## Seed Data

Four San Diego industrial properties:

| Property | Type | Status | Submarket |
|----------|------|--------|-----------|
| Miramar Distribution Center | Sale | Offers In | Miramar |
| Kearny Mesa Flex/Industrial | Sale | On Market | Kearny Mesa |
| Otay Mesa Logistics Hub | Lease | On Market | Otay Mesa |
| National City Industrial | Sale | In Escrow | National City |

The Miramar property is the flagship demo: 12 buyers, 3 competing offers, 11 DD room activities,
10 weeks of marketing metrics, 6 source signals, 1 published update + 1 pending draft.

## Extending to Real Data Sources

The `SourceSignal` model and `src/lib/ai-draft.ts` are designed for easy real-source integration.
Adapters to build:

```
src/lib/adapters/
  gmail.ts       → OAuth2 → Gmail API → fetch threads labeled [ListingName]
  granola.ts     → Granola API → fetch call transcripts by property tag
  pipedrive.ts   → Pipedrive API → fetch deal activity by property ID
```

Each adapter should return `{ sourceType, rawSnippet, capturedAt }[]` and be called by a
cron job or webhook that creates `SourceSignal` records. The `generateAIDraft()` function in
`ai-draft.ts` already reads all signals for the property.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma 7** + SQLite (`dev.db`)  
- **Tailwind CSS** + custom shadcn-style components
- **Recharts** for marketing trend charts
- **Anthropic SDK** (`claude-opus-4-8`) for AI drafts
- **Cookie-based sessions** (no external auth service)

## Deploy to Vercel

1. Push this repo to GitHub
2. Connect to Vercel
3. Set environment variables:
   - `DATABASE_URL` → your production database URL (PostgreSQL recommended for prod — swap Prisma provider)
   - `NEXTAUTH_SECRET` → a long random string
   - `ANTHROPIC_API_KEY` → your Anthropic key
   - `NEXTAUTH_URL` → your production URL
4. Run `npx prisma generate && npm run seed` in the Vercel build step or via a one-time script
