# RENTIFUL 🏠

A full-stack real estate rental platform built with Next.js and Express, letting managers list properties and tenants search, favorite, and apply for rentals — all with role-based dashboards, an interactive map, and a complete application-to-lease workflow.

**Live demo:** https://rental-real-state.vercel.app

---

## Features

- 🔐 **Authentication** — Email/password and Google OAuth sign-in via NextAuth, with role-based onboarding (Manager / Tenant)
- 🏘️ **Property listings** — Managers create, edit, and delete listings from the dashboard (photos, fees, amenities, highlights, and geocoded addresses) without touching the database
- 🔍 **Search & filters** — Location search, price range, beds/baths, property type, amenities, and square footage filters with URL-synced state
- 🗺️ **Interactive map** — Property locations rendered with React Leaflet and OpenStreetMap, including a themed popup preview
- ❤️ **Favorites** — Tenants can save and manage favorite properties
- 📝 **Applications & leases** — Tenants apply to properties; managers review, approve, or deny applications, which automatically generates a lease on approval
- 💳 **Tenant dashboard** — Current residences, billing history, and account settings
- 📊 **Manager dashboard** — Property management, per-property tenant/lease tracking, and application review
- ⚙️ **Account settings** — Profile updates, password change, and account deletion
- 🎨 **Responsive, polished UI** — Built with Tailwind CSS v4 and shadcn/ui components throughout

---

## Tech Stack

### Frontend (`client/`)
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, shadcn/ui (Base UI)
- **State management:** Redux Toolkit + RTK Query
- **Forms:** React Hook Form + Zod
- **Auth:** NextAuth v5 (credentials + Google OAuth)
- **Maps:** React Leaflet + OpenStreetMap tiles (no API key required)
- **Animation:** Framer Motion
- **Notifications:** Sonner (toast notifications)

### Backend (`server/`)
- **Framework:** Express + TypeScript
- **ORM:** Prisma v7 with the `@prisma/adapter-pg` driver adapter
- **Database:** PostgreSQL with PostGIS (spatial queries for location-based search)
- **Auth bridge:** Short-lived JWTs minted by the client, verified by Express middleware
- **Image uploads:** Cloudinary
- **Geocoding:** Nominatim (OpenStreetMap)

### Infrastructure
- **Database:** Neon (PostgreSQL + PostGIS)
- **API hosting:** Render
- **Frontend hosting:** Vercel

---

## Project Structure

```
real-state/
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── (auth)/         # Sign in / sign up pages
│   │   ├── (dashboard)/    # Manager & tenant dashboards
│   │   │   ├── managers/
│   │   │   │   ├── properties/          # List, tenants, edit/delete
│   │   │   │   ├── newproperty/         # Create listing
│   │   │   │   ├── applications/
│   │   │   │   └── settings/
│   │   │   └── tenants/    # Favorites, applications, residences, settings
│   │   ├── (nondashboard)/ # Landing, search, public property pages
│   │   ├── api/            # NextAuth, JWT minting, signup, onboarding, account
│   │   └── onboarding/     # Post-signup role selection
│   ├── components/         # Shared UI components
│   ├── lib/                # Utilities, Zod schemas, Prisma client
│   ├── prisma/             # Client-side Prisma schema (auth tables)
│   ├── state/              # Redux slices + RTK Query API
│   └── types/              # Global TypeScript types
│
└── server/                 # Express backend
    ├── src/
    │   ├── controllers/    # Route handlers (properties include PUT/DELETE)
    │   ├── middleware/     # JWT auth middleware
    │   ├── routes/         # Express routers
    │   └── lib/            # Prisma client singleton
    └── prisma/             # Database schema, migrations, seed
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- A PostgreSQL database with PostGIS enabled (local, Docker, or a hosted provider)
- A free [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [Google Cloud](https://console.cloud.google.com/) OAuth client (for Google sign-in)

### 1. Clone and install

```bash
git clone https://github.com/pramodsinzh/real-state.git
cd real-state
```

Install dependencies in both folders:

```bash
cd client && pnpm install
cd ../server && npm install
```

### 2. Set up the database

Enable PostGIS on your Postgres instance:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Environment variables

**`server/.env`**

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3002
FRONTEND_URL=http://localhost:3000
```

**`client/.env`**

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
AUTH_SECRET=your_random_secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_random_secret  # must match server's exactly
NEXT_PUBLIC_SERVER_URL=http://localhost:3002
```

> `JWT_SECRET` must be identical on both client and server — it's how the client's minted tokens are verified by the Express API.
> For local development, point both `DATABASE_URL` values at the **same** Postgres database so NextAuth users and rental data stay in sync.

### Production deploy checklist (Vercel + Render + Neon)

**1. Neon**
- Create/use one Neon database
- Prefer the **pooled** connection string (`-pooler` host) for serverless
- Enable PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Run migrations against Neon from your machine:
  ```bash
  cd server
  # set DATABASE_URL to Neon temporarily
  npx prisma migrate deploy
  ```

**2. Render (Express API)**
```env
DATABASE_URL=<same Neon pooled URL>
JWT_SECRET=<strong random secret>
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=10000
```

**3. Vercel (Next.js) — all as Config (not Secret for `NEXT_PUBLIC_*`)**
```env
DATABASE_URL=<same Neon pooled URL>
AUTH_SECRET=<npx auth secret>
AUTH_URL=https://your-app.vercel.app
AUTH_TRUST_HOST=true
JWT_SECRET=<exactly the same value as Render>
NEXT_PUBLIC_SERVER_URL=https://your-api.onrender.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**4. Google OAuth**
- Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

**5. Redeploy** both Vercel and Render after saving env vars.

### 4. Run migrations

```bash
cd server
npx prisma migrate deploy
npx prisma generate

cd ../client
npx prisma generate
```

Optional sample data:

```bash
cd server
npm run seed
```

### 5. Start the dev servers

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
pnpm run dev
```

Visit `http://localhost:3000`.

---

## Manager property workflow

Managers no longer need to edit listings in the database.

1. Sign in as a **manager**.
2. Open **My Properties** (or **Add New Property** from the navbar).
3. Create a listing, or open an existing one and choose **Edit Property** (pencil on the card).
4. Update details, keep or replace photos, then **Save Changes**.
5. To remove a listing, use **Delete this property** and type `delete` to confirm. Related leases, payments, and applications are removed with it.

Only the manager who owns the listing can update or delete it.

---

## Key Architectural Notes

- **Auth bridge:** Since the client (Next.js/NextAuth) and server (Express) are separate services, the client mints a short-lived JWT at `/api/auth/token` on demand, which Express verifies via custom middleware — this keeps the Express API stateless while still trusting the authenticated session.
- **Ownership checks:** Write endpoints (favorites, applications, lease status, profile updates, and property create/update/delete) verify the requesting user owns the resource, not just that they are authenticated.
- **No paid APIs:** Every third-party service used (Cloudinary, Nominatim, OpenStreetMap/Leaflet, NextAuth) has a genuinely free tier with no credit card required, replacing the AWS/Mapbox stack from the original tutorial this project was built from.

---

## License

This project is for educational/portfolio purposes.
