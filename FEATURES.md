# Feature inventory

Inventory of what the app (currently branded **Project Sphere**, package
`project-sphere`) does today and what its copy, pricing and data model say it is
meant to do. The product name is config-driven (`src/config/site.ts`), so this
document refers to "the app" where possible.

Status legend: **Built** = working code path · **Partial** = UI or API exists but
is incomplete/stubbed · **Planned** = promised in copy/pricing/constants, no code yet.

## 1. Marketing site

| Feature                                                                                                                                                                                             | Status                                                | Where                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| Landing page: hero "Collaborate, Create, and / Conquer Projects with Ease!" + tagline                                                                                                               | Built                                                 | `src/components/hero.tsx`, `src/app/page.tsx`                  |
| Feature cards: Effortless Task Management (flame cursor effect), Secure Authentication, Seamless Project Sharing (live-cursor animation), Reference Integration (web scrape), AI-Powered Assistance | Built                                                 | `src/components/card/*`                                        |
| Encrypt/scramble text button demo                                                                                                                                                                   | Built                                                 | `src/components/dev/encryption-button.tsx`                     |
| Navbar with Docs / Pricing links, GitHub star count (GitHub API), auth-aware CTA (Sign In vs Dashboard + avatar hover card)                                                                         | Built                                                 | `src/components/navbar/*`                                      |
| Footer "Built by Sarang …"                                                                                                                                                                          | Built                                                 | `src/components/footer.tsx`                                    |
| Pricing page: 3 plan cards (Free ₹0, Gold ₹299.99 "Most Popular", Platinum ₹499.99), feature comparison table (desktop + mobile), FAQ accordion                                                     | Built                                                 | `src/app/pricing`, `src/components/pricing/*`, `src/constants` |
| Docs page (`/docs`, `/docs/guides`, `/docs/api` linked from dashboard)                                                                                                                              | Partial (placeholder)                                 | `src/app/docs/page.tsx`                                        |
| SEO: metadata templates, OG image, sitemap, robots, web manifest                                                                                                                                    | Built (manifest icons in `/public/icons` are missing) | `src/app/{sitemap,robots,manifest}.ts`                         |
| Vercel Analytics                                                                                                                                                                                    | Built                                                 | `src/app/layout.tsx`                                           |

## 2. Authentication

| Feature                                                                         | Status                                                                                                        | Where                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Email + password sign up (bcrypt hash, duplicate check)                         | Built                                                                                                         | `src/app/api/v1/auth/sign-up`, `src/components/auth/signup-form.tsx` |
| Email + password sign in (credentials provider, JWT session)                    | Built                                                                                                         | `src/app/api/auth/[...nextauth]`, `signin-form.tsx`                  |
| Google and GitHub OAuth                                                         | Partial (shown only outside production; users are not persisted to DB because the Prisma adapter is disabled) | `options.ts`, `auth/*/page.tsx`                                      |
| Auth split-screen layout with product blurb                                     | Built                                                                                                         | `src/app/auth/layout.tsx`                                            |
| Route protection for `/dashboard`, redirect signed-in users away from `/auth/*` | Partial (middleware logic commented out)                                                                      | `src/middleware.ts`, `src/lib/routes.ts`                             |
| Email verification, forgot password tokens                                      | Planned (fields exist on `User`)                                                                              | `prisma/schema.prisma`                                               |

## 3. Dashboard & projects

| Feature                                                                                                                                                           | Status                                                        | Where                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| Projects list with search (`?query=`), empty state, project cards (avatar, private lock, GitHub/deployed links, created time)                                     | Built                                                         | `src/app/dashboard/page.tsx`, `project-card.tsx`               |
| Mark project as favourite (toggle)                                                                                                                                | Built                                                         | `api/v1/project/favourite`, `mark-favourite-button.tsx`        |
| Create project (title, description ≥16 chars, deployed URL, GitHub URL, private, favourite) with plan limit check (3 / 10 / 30) and "Upgrade Subscription" prompt | Built                                                         | `dashboard/(overview)/create/project`, `api/v1/project/create` |
| Edit project details ("Danger Zone" form)                                                                                                                         | Built                                                         | `project/[projectId]/settings`, `api/v1/project/update`        |
| Project overview: banner, task gauges, collaborators avatars, "Invite Collaborators", description, latest 4 tasks with markdown accordion, "+ Add a new Task"     | Partial (collaborators/gauges are placeholder data)           | `project/[projectId]/page.tsx`                                 |
| Sidebar with project usage gauge (projects used vs plan limit) and user/plan status                                                                               | Built                                                         | `sidebar-status.tsx`, `guage.tsx`                              |
| Collapsible project sidebar: Home, Todo, Docs, Web Scrape, AI Assistance, Package Finder, Settings                                                                | Built (nav only)                                              | `project-sidebar.tsx`, `constants`                             |
| Account settings page                                                                                                                                             | Partial (placeholder)                                         | `dashboard/(overview)/settings`                                |
| Task management (todo board, statuses PENDING / IN_PROGRESS / COMPLETED, estimates)                                                                               | Partial (model + seed data + read-only cards; no CRUD UI/API) | `Task` model, `todo/page.tsx`                                  |
| Project documentation page                                                                                                                                        | Planned (placeholder)                                         | `documentation/page.tsx`                                       |
| Secure share links with expiry and role (VIEWER/EDITOR)                                                                                                           | Partial (schema + stub API, form commented out)               | `api/v1/project/share/create`, `share-container.tsx`           |
| Collaboration / roles (OWNER, COLLABORATOR, VIEWER, ADMIN)                                                                                                        | Planned (enum only)                                           | `Role` enum                                                    |
| Web scrape a reference URL to plain text                                                                                                                          | Partial (API works; UI only on `/test`)                       | `api/v1/scrape`                                                |
| AI assistant per project (GPT-3.5 for Free/Gold, GPT-4 for Platinum)                                                                                              | Planned (placeholder page; model per tier in config)          | `config/subscription.ts`, `ai-assistance/page.tsx`             |
| Package finder (search npm by prompt)                                                                                                                             | Planned (placeholder)                                         | `package/page.tsx`                                             |
| `/api/v1/all` debug endpoint returning every user + project                                                                                                       | Built — **security risk**, should be removed or admin-only    | `api/v1/all`                                                   |

## 4. Billing

| Feature                                                                  | Status         | Where                                       |
| ------------------------------------------------------------------------ | -------------- | ------------------------------------------- |
| Plans FREE / GOLD / PLATINUM with project limits and AI model            | Built (config) | `config/subscription.ts`                    |
| Stripe Checkout (subscription mode, plans from `config/subscription.ts`) | Done           | `api/v1/billing/checkout`                   |
| Stripe webhook syncs subscription to User                                | Done           | `api/v1/webhook`, `lib/billing.ts`          |
| LemonSqueezy checkout                                                    | Removed        | -                                           |
| Billing portal (manage/cancel/change plan)                               | Done           | `api/v1/billing/portal`, dashboard settings |

Pricing copy promises (planned, not built): priority-based task management,
contextual AI, customizable link expiration, role-based access, premium
templates/themes, analytics & reporting, workflow customization, enterprise
security, dedicated account manager, priority support, onboarding assistance.

## 5. Data & tooling

- MongoDB via Prisma: `User`, `Project`, `Task`, enums `Role`, `SubscriptionTier`, `TaskStatus`.
- Seed script with sample user/project/task JSON (`npm run seed`, refuses to run in production).
- Dev helpers: `/test` pages, Tailwind breakpoint indicator.
- Prettier + Tailwind plugin, husky + lint-staged pre-commit.

## 6. Known issues found while auditing

- Product name typos: "Project Space" on auth pages, `githubRepoName: "Project-Shere"`.
- Project card shows placeholder subtitle `asefasdfasferefgqerf`.
- Project API routes trust `userId` / `projectId` from the request body without checking the session owner.
- `"Invite Collaborators"` link is missing a `/` before `settings#share`.
- Manifest references icons that are not in `public/`.
