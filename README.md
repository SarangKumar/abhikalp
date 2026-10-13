# Abhikalp (name is config-driven)

The app name, URL and repo come from `src/config/site.ts`, and you can override them with `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_SHORT_NAME` and `NEXT_PUBLIC_APP_URL`. Never hard-code the name in components. See `FEATURES.md` for the feature inventory.

## Stack

Next.js 16 (App Router, Turbopack, `src/proxy.ts`), React 19, TypeScript 5.9, Tailwind CSS v4, Vinyaas UI (`src/components/ui`), next-auth v4 (credentials, Google, GitHub), Prisma 6 with MongoDB, Stripe subscriptions, zod 4 and next-themes (purple theme with dark and light modes).

## Setup

```bash
cp .env.example .env.local   # fill in values
npm install                  # runs prisma generate
npx prisma db push
npm run dev
```

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck`, `check` (all checks), `seed`, `stripe:listen`, `format`.

## Stripe

1. Create two recurring prices (Gold and Platinum) and set `STRIPE_PRICE_GOLD` and `STRIPE_PRICE_PLATINUM`. Plan limits live in `src/config/subscription.ts`.
2. Enable the Customer Portal in the Stripe dashboard. Plan changes and cancellations go through the portal.
3. Webhook: `POST /api/v1/webhook` with the events `checkout.session.completed` and `customer.subscription.created`/`updated`/`deleted`. For local testing, run `npm run stripe:listen` and copy the `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## Features

Projects, kanban tasks (priority, estimate, due date), project markdown docs, web-scrape references, an AI assistant, an npm package finder, collaborators with roles (Owner, Admin, Collaborator, Viewer) and email-bound invite links, plus Stripe billing. See `FEATURES.md` and `/docs`.

## AI assistant (optional)

Set `OPENAI_API_KEY` (and optionally `OPENAI_BASE_URL` for any OpenAI-compatible provider, and `AI_MODEL`). Without it, the AI page shows a "not configured" state. Models per plan live in `src/config/subscription.ts`.

## Icons

`npm run icons` regenerates `public/icons/*`, `src/app/icon.png` and `apple-icon.png` from the app name (run it again after renaming).

## UI

The components come from Vinyaas (`npx vinyaas add <name>`). Theme tokens live in `src/app/globals.css`; change `--brand-h` to re-hue the brand colour.
