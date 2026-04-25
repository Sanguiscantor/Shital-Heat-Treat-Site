# Client Portal + Worker Ops Setup

## Backend/Database choice
- This implementation uses Postgres via `DATABASE_URL`, which is directly compatible with Supabase Postgres.
- For your size (~200 customers), Supabase free tier is a practical starting point.

## Environment configuration
- Copy `artifacts/api-server/.env.example` to `artifacts/api-server/.env` and fill real values.
- Copy `artifacts/shital-heat-treat/.env.example` to `artifacts/shital-heat-treat/.env` when frontend and API are on different domains.

## Database schema provisioning
1. Set `DATABASE_URL`.
2. Run:
   - `corepack pnpm --filter @workspace/db run push`

## API contract generation
- OpenAPI lives in `lib/api-spec/openapi.yaml`.
- Regenerate clients after API changes:
  - `corepack pnpm --filter @workspace/api-spec exec orval --config ./orval.config.ts`

## Local run
- API:
  - `corepack pnpm --filter @workspace/api-server run build`
  - `node artifacts/api-server/dist/index.mjs`
- Frontend:
  - `corepack pnpm --filter @workspace/shital-heat-treat run dev`

## Bootstrap first admin
- Call `POST /api/auth/bootstrap-admin` once:
  - `{ \"email\": \"admin@yourcompany.com\", \"password\": \"StrongPass123\", \"fullName\": \"Admin\" }`

## Vercel + API load control notes
- Keep Vercel for static frontend hosting.
- Host API separately (Render/Railway/Fly/Supabase Edge Functions) to avoid function overage.
- Existing safeguards:
  - role-scoped queries for client accounts,
  - capped list endpoint limits (`max 100`),
  - basic request throttling via in-memory rate limit middleware.

