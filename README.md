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

- GET /properties — search/filter/paginate (public, auth-aware for isSaved/contact-gating once available)
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
- POST /properties/:propertyId/reviews — GPS-gated, photo upload supported

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
- PATCH /users/me/avatar
- DELETE /users/me
- GET /users/:id/profile — public agent/landlord profile

_Auth_ (in progress)

- POST /auth/request-code
- POST /auth/verify-code
- POST /auth/google
- PATCH /auth/complete-profile
- POST /auth/refresh
- POST /auth/logout

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
│   │   └── seed.ts
│   ├── docs/
│   ├── errors/
│   ├── lib/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── templates/
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
└── tsdownconfig.ts

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
cd my-ulo-backend
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

## 6. Start the development server

```bash
npm run dev
```

## 6. Verify the server

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
| JWT_REFRESH_SECRET        | Refresh token secret                |
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

Never commit your `.env` file.

---

# Available Scripts

| Script             | Description                 |
| ------------------ | --------------------------- |
| npm run dev        | Start development server    |
| npm run build      | Build the application       |
| npm start          | Run production build        |
| npm run type-check | Run TypeScript checks       |
| npm run lint       | Run linting                 |
| npm run format     | Format source files         |
| npm run generate   | Generate Drizzle migrations |
| npm run migrate    | Run database migrations     |
| npm run seed       | Seed the database           |
| npm run prepare    | Install Git hooks           |

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

Automated tests will be added as the project evolves.

Future tests should cover:

- Authentication
- Property Management
- Reviews
- Payments
- Verification
- Location Services

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
