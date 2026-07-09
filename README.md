# my-ulo-app-backend

> Backend API for **My Ulo**, a PropTech platform that helps Nigerians find verified rental and purchase properties through identity-verified agents and landlords, location-aware property data, secure payments, and transparent property reviews.

---

## Table of Contents

- Prerequisites
- Tech Stack
- Current API Surface
- Project Structure
- Getting Started
- Environment Variables
- Available Scripts
- Development Workflow
- Testing
- Git Workflow and Commit Convention
- Before You Push – Sync Your Env

---

# Prerequisites

Before you begin, ensure you have the following installed:

| Tool       | Notes                                    |
| ---------- | ---------------------------------------- |
| Node.js    | Current LTS version recommended          |
| npm        | Default package manager for this project |
| PostgreSQL | Database server                          |
| PostGIS    | PostgreSQL spatial extension             |

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
- **Authentication** — JWT + Argon2
- **File Storage** — Cloudinary
- **Identity Verification** — Smile Identity
- **Payments** — Paystack
- **Logging** — Pino + pino-http
- **Security** — Helmet, CORS, Cookie Parser, Rate Limiter
- **API Documentation** — Swagger (OpenAPI)
- **Git Hooks** — Husky + Commitlint

---

# Current API Surface

The backend currently provides the project foundation while feature modules are being developed.

Current endpoints include:

- `GET /health`
- API routes mounted under `/api/v1`
- Global error handling
- Request logging
- Swagger documentation setup

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
├── drizzle.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

### Notable folders

- `config/` contains application configuration.
- `controllers/` handles incoming HTTP requests.
- `services/` contains business logic.
- `routes/` defines API endpoints.
- `db/` manages database configuration, migrations, seeding, and schema definitions.
- `middlewares/` contains reusable Express middleware.
- `validations/` stores Zod validation schemas.
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

## 4. Run database migrations

```bash
npm run migrate
```

## 5. Start the development server

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

| Variable                | Description                  |
| ----------------------- | ---------------------------- |
| NODE_ENV                | Application environment      |
| PORT                    | Server port                  |
| DATABASE_URL            | PostgreSQL connection string |
| JWT_SECRET              | JWT signing secret           |
| JWT_REFRESH_SECRET      | Refresh token secret         |
| CLOUDINARY_CLOUD_NAME   | Cloudinary configuration     |
| CLOUDINARY_API_KEY      | Cloudinary configuration     |
| CLOUDINARY_API_SECRET   | Cloudinary configuration     |
| PAYSTACK_SECRET_KEY     | Paystack Secret Key          |
| PAYSTACK_WEBHOOK_SECRET | Paystack Webhook Secret      |
| SMILE_ID_API_KEY        | Smile Identity API Key       |

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
