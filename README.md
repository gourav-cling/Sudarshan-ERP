# Sudarshan ERP (Next.js)

Next.js App Router port of the **Sudarshan Group** ERP prototype with **MongoDB-backed data**, **iron-session auth**, and shared React UI components.

## Run locally

```bash
cd sudarshan-next
npm install
cp .env.example .env.local
# Edit .env.local — set MONGODB_URI and SESSION_SECRET
npm run seed          # populate MongoDB (idempotent; skips if data exists)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/login`.

**Demo login** (after `npm run seed`):

| Email | Password |
|-------|----------|
| `rajiv@sudarshan.co.in` | `sudarshan123` |
| `priya@sudarshan.co.in` | `sudarshan123` |
| `anil@sudarshan.co.in` | `sudarshan123` |

Production build:

```bash
npm run build
npm start
```

## Data behaviour (empty vs seeded)

| State | What you see |
|-------|----------------|
| **`MONGODB_URI` set, DB empty** | Empty tables/KPIs (0 or —), banner: *"Run npm run seed"*. No fake rows. |
| **`MONGODB_URI` set, after `npm run seed`** | UI reflects exactly what is stored in `entitystores` / `users`. Delete MongoDB docs → UI updates on refresh. |
| **`MONGODB_URI` unset** | No ERP data and login blocked unless `USE_MOCK_DATA=true` in `.env.local`. |
| **`USE_MOCK_DATA=true` (no Mongo)** | Full in-memory demo dataset for local UI-only work — not for production. |

`npm run seed` is the **only** supported way to load demo business data into MongoDB. It reads `.env.local` then `.env` (same as Next.js).

To reset demo data: drop the `entitystores` and `users` collections (or the whole DB), then run `npm run seed` again.

## Project layout

```
src/
  app/                    # Routes & API handlers
    api/
      auth/               # login, logout, session, forgot
      bootstrap/          # full ERP dataset for client (+ meta)
      entities/[key]/     # per-entity GET/PATCH
      seed/               # POST to seed database
  components/
    ui/                   # re-exports (Btn, Kpi, Modal, charts…)
    forms/                # FormField, EntityFormModal, useFormState
    layout/               # Sidebar, Topbar, PageShell
    erp/                  # domain screens (ported from original JSX)
  hooks/
    use-entity-mutation.ts # POST/PATCH helpers + refresh bootstrap
  context/
    erp-data-provider.tsx # loads /api/bootstrap
  lib/
    mongodb.ts            # connection singleton
    db-entities.ts        # entity load/seed (no silent seed fallback)
    empty-erp-data.ts     # empty dataset shape
    erp-stats.ts          # KPI/badge aggregations from entities
    seed-data.ts          # canonical demo dataset (seed script only)
    session.ts            # iron-session config
  models/
    User.ts
    EntityStore.ts
scripts/
  seed.ts                 # CLI seed (npm run seed)
```

## MongoDB collections

| Collection | Contents |
|------------|----------|
| `users` | Auth accounts (bcrypt passwords) |
| `entitystores` | One doc per entity key (`companies`, `orders`, `rawMaterials`, …) |

Entity keys: `companies`, `rawMaterials`, `packaging`, `spareParts`, `spareCategories`, `vendors`, `purchaseOrders`, `customers`, `orders`, `invoices`, `dispatches`, `employees`, `permissions`, `roles`, `notifications`, `revenueData`, `productionData`, `fieldVisits`, `attendanceToday` (stored in `meta`).

## API routes

All JSON responses use `{ data, error }`. `/api/bootstrap` also returns `meta` (`source`, `dbConfigured`, `isEmpty`, `warning`).

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/bootstrap` | GET | Full ERP dataset from MongoDB (or empty / mock) |
| `/api/seed` | POST | Seed DB (disable in prod) |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/users` | POST | Create ERP user (bcrypt password) |
| `/api/entities/[key]` | GET, POST, PATCH, DELETE | Entity CRUD |

### Form mutations (examples)

```bash
# Add a customer
curl -X POST http://localhost:3000/api/entities/customers \
  -H "Content-Type: application/json" \
  -d '{"item":{"id":"C-099","name":"Test Co","city":"Pune","orders":0,"ytd":0,"terms":"Net 30","status":"active"}}'

# Update invoice status
curl -X PATCH http://localhost:3000/api/entities/invoices \
  -H "Content-Type: application/json" \
  -d '{"id":"INV-HTM-26-0517","patch":{"status":"matched","reason":"Approved"}}'

# Replace full collection (bulk)
curl -X PATCH http://localhost:3000/api/entities/customers \
  -H "Content-Type: application/json" \
  -d '{"items":[...]}'
```

All ERP modals (Add customer, Create order, Add vendor, Issue spare, etc.) call these APIs via `useEntityMutation()` and refresh `/api/bootstrap` on success.

## Environment variables

See `.env.example`:

- `MONGODB_URI` — MongoDB connection string (required for real data)
- `SESSION_SECRET` — min 32 chars for iron-session
- `USE_MOCK_DATA` — optional; `true` enables in-memory demo when `MONGODB_URI` is unset

## Route map

Desktop ERP: `/dashboard/master`, `/inventory/raw-material`, `/procurement/invoices`, … Mobile: `/mobile`.

## Known gaps

1. **Some dashboard widgets** — Activity feeds, owner product-line bars, fleet map pins, and a few admin charts still use static layout data; KPIs, tables, and form saves use MongoDB.
2. **Mobile screens** — Mobile artboards are not wired to form APIs yet.
3. **CSV / file upload** — Import CSV and invoice file upload are metadata-only stubs.
4. **TypeScript** — Legacy screens use `// @ts-nocheck`.

## Verification

```bash
npm run build
npm run seed   # requires MongoDB + MONGODB_URI in .env.local or .env
```

After seed, open `/dashboard/master` — KPIs and sidebar badges should match seeded counts. Clear `entitystores` in MongoDB and refresh — tables empty and banner shown.
