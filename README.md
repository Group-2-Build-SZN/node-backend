# my-ulo-app-backend

> Backend API for **My Ulo**, a PropTech platform that helps Nigerians find verified rental and purchase properties through identity-verified agents and landlords, location-aware property data, secure payments, and transparent property reviews.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Current API Surface](#current-api-surface)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Git Workflow and Commit Convention](#git-workflow-and-commit-convention)
- [Before You Push - Sync Your Env](#before-you-push---sync-your-env)

---

# Prerequisites

Before you begin, ensure you have the following installed:

| Tool                                      | Notes                                    |
| ----------------------------------------- | ---------------------------------------- |
| [Node.js](https://nodejs.org/)            | Current LTS version recommended          |
| [npm](https://www.npmjs.com/)             | Default package manager for this project |
| [PostgreSQL](https://www.postgresql.org/) | Database server                          |
| [PostGIS](https://postgis.net/)           | PostgreSQL spatial extension             |

> Do not mix package managers. This project uses **npm**.

---

# Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Language** — TypeScript
- **Database** — PostgreSQL
- **ORM** — Drizzle ORM
- **Spatial Database** — PostGIS
- **Validation** — Zod
- **Authentication** — Passwordless (email OTP) + Google Sign-In + JWT (Access & Refresh tokens), Argon2 for hashing login codes
- **File Storage** — Cloudinary(via Multer)
- **Identity Verification** — Dojah (synchronous NIN/CAC lookup)
- **Payments** — Paystack (recurring monthly subscription)
- **Logging** — Pino + pino-http
- **Security** — Helmet, CORS, Cookie Parser, Rate Limiter
- **API Documentation** — Swagger (OpenAPI), deployed alongside the API on Azure for frontend consumption
- **Git Hooks** — Husky + Commitlint

> _Note on Identity Verification:_ Dojah's synchronous lookup was the best fit driven by cost and integreation complexity for a 4-week MVP.

---

# Current API Surface

All routes are mounted under /api/v1, plus a root-level health check.

- GET /health

_Properties_

- GET /properties — search/filter/paginate (public; auth-aware for isSaved and view tracking when a valid token is present)
- GET /properties/recommended
- GET /properties/:id — includes Trek Check, trust score, owner info (contact gated by premium status), isSaved
- POST /properties — agent/landlord only
- PATCH /properties/:id
- PATCH /properties/:id/publish — requires owner KYC verified
- DELETE /properties/:id
- POST /properties/:id/media — photo/video upload via Cloudinary
- POST /properties/:id/report — reason, description, evidence upload
- POST /properties/:id/save, DELETE /properties/:id/save

_Saved_

- GET /saved — supports ?listingPurpose=rent|sale
- GET /saved/counts

_Saved Filters_

- GET /saved-filters, POST /saved-filters, DELETE /saved-filters/:id

_Reviews_

- GET /properties/:propertyId/reviews — public, paginated, split into verifiedResident / communityTip
- POST /properties/:propertyId/reviews — GPS-gated, photo upload supported, limited to once per property per rolling 30-day window
- PATCH /properties/:propertyId/reviews/:reviewId — edit ratings/text only (GPS/location cannot be changed after submission)
- DELETE /properties/:propertyId/reviews/:reviewId

_Inquiries_

- POST /properties/:id/inquiries
- GET /inquiries

_Amenities_

- GET /amenities — filter by type, optional proximity search

_KYC_

- POST /kyc/verify-nin
- POST /kyc/verify-cac
- GET /kyc/status

_Payments_

- POST /payments/subscribe
- POST /payments/webhook
- GET /payments/history
- GET /payments/subscription
- POST /payments/cancel

_Referrals_

- GET /referrals/me
- POST /referrals/apply

_Users_

- GET /users/me
- GET /users/me/stats — saved/viewed/inquiries counts for the Profile screen's Account Overview
- PATCH /users/me/avatar
- DELETE /users/me
- GET /users/:id/profile — public agent/landlord profile

_Contact_

- POST /contact — public, rate-limited (3/hour per IP); notifies SUPPORT_EMAIL and stores the message

_Auth_

- POST /auth/request-code, POST /auth/verify-code, POST /auth/google, PATCH /auth/complete-profile, POST /auth/refresh, POST /auth/logout

_Admin_ (requires admin role — bootstrapped manually, no self-registration)

- GET /admin/reports — supports ?status=open|under_review|resolved|dismissed and ?propertyId=
- PATCH /admin/reports/:id/status
- PATCH /admin/properties/:id/status
- GET /admin/kyc/review-needed
- PATCH /admin/kyc/:id/resolve
- PATCH /admin/users/:id/blacklist — also revokes all active sessions and unpublishes all of that user's listings

---

# Project Structure

```text
.
├── .github/
├── .husky/
├── scripts/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── db/
│   │   ├── schema/
│   │   ├── migrations/
│   │   ├── index.ts
|   |   ├── seed.ts
|   |   ├── seed-production.ts
│   │   └── cleanup-dev-seed.ts
│   ├── docs/
│   ├── errors/
│   ├── lib/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── templates/
|   ├── tests/
│   ├── types/
│   ├── utils/
│   └── validations/
├── .env.example
├── .oxlintignore
├── commitlint.config.cjs
├── drizzle.config.ts
├── lint-staged.config.js
├── oxlintrc.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
├── tsdownconfig.json
└── vitest.config.ts

```

### Notable folders

- `config/` env validation and database connection setup.
- `controllers/` handles incoming HTTP requests.
- `services/` contains business logic.
- `routes/` defines API endpoints.
- `db/` manages database configuration, migrations, seeding, and schema definitions.
- `middlewares/` contains reusable Express middleware.
- `validations/` stores Zod validation schemas.
- `lib/` contains thin wrappers around third-pary APIs.
- `docs/` contains Swagger/OpenAPI documentation.

---

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/Group-2-Build-SZN/node-backend.git
cd node-backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create your environment file

```bash
cp .env.example .env
```

Update the values in `.env`.

## 4. Enable PostGIS on your database

```sql
CREATE EXTENSION IF NOT EXISTS postgis
```

## 5. Run database migrations

```bash
npm run migrate
```

## 6. Seed reference data

```bash
npm run seed
```

## 7. Start the development server

```bash
npm run dev
```

## 8. Verify the server

```bash
GET http://localhost:5000/health
```

---

# Environment Variables

The application uses environment variables stored in `.env`.

Common variables include:

| Variable                  | Description                         |
| ------------------------- | ----------------------------------- |
| NODE_ENV                  | Application environment             |
| PORT                      | Server port                         |
| DATABASE_URL              | PostgreSQL connection string        |
| ALLOWED_ORIGINS           | Comma-separated list                |
| JWT_SECRET                | JWT signing secret                  |
| CLOUDINARY_CLOUD_NAME     | Cloudinary configuration            |
| CLOUDINARY_API_KEY        | Cloudinary configuration            |
| CLOUDINARY_API_SECRET     | Cloudinary configuration            |
| PAYSTACK_SECRET_KEY       | Paystack Secret Key                 |
| PAYSTACK_PLAN_CODE        | Pystack plan code                   |
| DOHAH_APP_ID              | Dojah KYC - App ID                  |
| DOJAH_SECRET_KEY          | Dojah KYC - Secret key              |
| DOJAH_BASE_URL            | Dojah API Base URL                  |
| EMAIL_HOST/PORT/USER/PASS | SMTP config for sending login codes |
| OTP_EXPIRY_MINUTES        | Login code expiry window            |
| OTP_CODE_LENGTH           | Digits in the emailed login code    |
| GOOGLE_CLIENT_ID          | Google Sign-In token verification   |
| SUPPORT_EMAIL             | Address that receives `/contact`    |

Never commit your `.env` file.

---

# Available Scripts

| Script                      | Description                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| npm run dev                 | Start development server                                                                                                         |
| npm run build               | Build the application                                                                                                            |
| npm start                   | Run production build                                                                                                             |
| npm run type-check          | Run TypeScript checks                                                                                                            |
| npm run lint                | Run linting                                                                                                                      |
| npm run format              | Format source files                                                                                                              |
| npm run generate            | Generate Drizzle migrations                                                                                                      |
| npm run migrate             | Run database migrations                                                                                                          |
| npm run seed                | Seed the database with reference/test data (refuses to run if `NODE_ENV=production`)                                             |
| npm run seed-production     | Seed a small set of richer demo listings/reviews into whatever DATABASE_URL points at; requires SEED_CONFIRM=yes-seed-production |
| npm run cleanup-dev-seed    | removes the dummy seed.ts test data from whatever DATABASE_URL points at; also requires SEED_CONFIRM=yes-seed-production         |
| npx tsx scripts/reset-db.ts | Drop all tables/types in dev — clean slate before re-migrating (refuses to run if NODE_ENV=production)                           |
| npm run test                | Run the automated test suite (Vitest + Supertest) against the test database                                                      |
| npm run test:watch          | Run tests in watch mode during development                                                                                       |
| npm run prepare             | Install Git hooks                                                                                                                |

---

# Development Workflow

1. Pull the latest changes from the `dev` branch.
2. Create a feature branch.

Example:

```text
feat/authentication
feat/property-module
fix/payment-webhook
```

3. Implement your feature.
4. Run:

```bash
npm run lint
npm run type-check
```

5. Commit using Conventional Commits.
6. Push your branch.
7. Open a Pull Request into `dev`.

---

# Testing

Automated tests are set up using _Vitest + Supertest_, run against a dedicated Neon test branch (never against production or shared dev data).

## Setup (one-time)

1. Create a `test` branch on Neon (Neon console → Branches → Create branch).
2. Copy its connection string into a local `.env.test` (see `.env.test` structure — not committed, same as .env).
3. Run migrations against it once: `DATABASE_URL="your-test-branch-url" npx drizzle-kit migrate`.

## Running tests

bash
npm run test # single run
npm run test:watch # watch mode

Third-party integrations (Dojah, Cloudinary, email sending) are mocked in tests (`src/tests/mocks/integrations.ts`) — no real network calls, no real emails sent, no sandbox API usage during test runs.

## Current coverage (critical paths, not full endpoint coverage — a deliberate scope decision given the sprint timeline)

- _Auth:_ new user creation on first login, wrong-code rejection, unauthenticated route rejection
- _Property publish gating:_ rejects publishing without at least one photo and one video
- _Payments:_ Paystack webhook signature verification (valid + invalid + missing signature), isPremium activation/deactivation lifecycle
- _KYC:_ name-match outcomes (verified / review_needed / rejected), and the blacklist re-registration block

## Not yet covered — future automated tests should extend to

- Properties CRUD beyond publish gating
- Reviews (GPS-gating logic, cooldown, edit/delete)
- Amenities, saved properties/filters, inquiries, referrals
- Admin endpoints (report resolution, blacklist cascade)

CI runs the full suite automatically on every push/PR via a throwaway PostGIS-enabled Postgres service container — see `.github/workflows/ci.yml`.

## Note on seeding production

Two dedicated scripts exist for working with a deployed database directly, both gated behind `SEED_CONFIRM=yes-seed-production so they can't run by accident`:

bash

# Populate a handful of realistic demo listings + reviews

SEED_CONFIRM=yes-seed-production DATABASE_URL="your-production-connection-string" npm run seed-production

# Remove the bare-bones dummy listing from src/db/seed.ts, if it was ever run against this database

SEED_CONFIRM=yes-seed-production DATABASE_URL="your-production-connection-string" npm run cleanup-dev-seed

`npm run seed` itself still refuses to run when `NODE_ENV=production` by design — do not override that guard to seed a deployed database. Use `seed-production` instead, which is meant for exactly this and doesn't touch anything outside its own dedicated demo user's data.

---

# Continuous Integration

GitHub Actions runs automatically on every push and pull request to dev/main:

- _CI_ (`.github/workflows/ci.yml`) — install, lint, type-check, build, and run the automated test suite against a throwaway `postgis/postgis` Postgres service container (spun up fresh per run, not the Neon test branch used locally)
- _Commit Lint_ (`.github/workflows/commitlint.yml`) — validates every commit in a PR follows Conventional Commits
- _Build and deploy to Azure_ (`.github/workflows/dev_myulo-api.yml`) — on every push to `dev`, builds and deploys to the `myulo-api` Azure Web App. This workflow only builds/deploys; it does not run tests (that's CI's job — running the integration suite here would need production secrets it doesn't have). A `concurrency` group ensures a new push waits for an in-flight deploy to finish rather than racing it.

A PR with failing lint, type-check, build, tests, or commit-message checks should not be merged.

---

# Git Workflow and Commit Convention

This repository follows **Conventional Commits**.

### Examples

```text
feat(auth): implement login endpoint

feat(property): add property creation endpoint

fix(payment): handle failed webhook verification

refactor(review): simplify review service

docs: update README

chore: initialize backend project
```

---

# Before You Push – Sync Your Env

Whenever a new environment variable is introduced:

1. Update your local `.env`
2. Update `.env.example`
3. Never commit secrets
4. Verify all required keys are documented

---

# Auth Notes

Authentication is complete: passwordless email OTP, Google Sign-In, and JWT access tokens paired with **DB-backed, rotating refresh tokens** (`refresh_tokens` table) — not stateless JWT refresh tokens. Key behaviors worth knowing:

- Refresh tokens are opaque random strings, stored hashed (SHA-256) in the database, and **rotated on every use** — the old one is revoked the moment a new one is issued, so a stolen-but-unused refresh token becomes worthless as soon as the real owner refreshes again.

- `authenticate` (strict) vs. `attachUserIfPresent` (soft, doesn't reject unauthenticated requests) are both implemented — used on public-but-auth-aware routes like `GET /properties`.

- Blacklisted users are rejected at login/refresh time. Admin blacklisting also calls `revokeAllSessions()` to immediately kill a user's ability to refresh, without waiting for their short-lived (15 min) access token to expire naturally.
