# RENTIFUL 🏠

A full-stack real estate rental platform built with Next.js and Express, letting managers list properties and tenants search, favorite, and apply for rentals — all with role-based dashboards, an interactive map, and a complete application-to-lease workflow.

**Live demo:** [your-vercel-url-here](#)

---

## Features

- 🔐 **Authentication** — Email/password and Google OAuth sign-in via NextAuth, with role-based onboarding (Manager / Tenant)
- 🏘️ **Property listings** — Full CRUD for managers, with multi-image upload, amenities, highlights, and geocoded addresses
- 🔍 **Search & filters** — Location search, price range, beds/baths, property type, amenities, and square footage filters with URL-synced state
- 🗺️ **Interactive map** — Property locations rendered with React Leaflet and OpenStreetMap, including a themed popup preview
- ❤️ **Favorites** — Tenants can save and manage favorite properties
- 📝 **Applications & leases** — Tenants apply to properties; managers review, approve, or deny applications, which automatically generates a lease on approval
- 💳 **Tenant dashboard** — Current residences, billing history, and account settings
- 📊 **Manager dashboard** — Property management, tenant/application overview, and per-property lease tracking
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
- **Database hosting:** Railway (PostgreSQL + PostGIS)
- **API hosting:** Railway
- **Frontend hosting:** Vercel

---

## Project Structure

```
real-state/
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── (auth)/         # Sign in / sign up pages
│   │   ├── (dashboard)/    # Manager & tenant dashboards
│   │   ├── (nondashboard)/ # Landing, search, property listing pages
│   │   ├── api/            # NextAuth, token minting, signup routes
│   │   └── onboarding/     # Post-signup role selection
│   ├── components/         # Shared UI components
│   ├── lib/                 # Utilities, Zod schemas, Prisma client
│   ├── prisma/              # Client-side Prisma schema (auth tables)
│   ├── state/               # Redux slices + RTK Query API
│   └── types/                # Global TypeScript types
│
└── server/                 # Express backend
    ├── src/
    │   ├── controllers/     # Route handlers
    │   ├── middleware/       # JWT auth middleware
    │   ├── routes/            # Express routers
    │   └── lib/                # Prisma client singleton
    └── prisma/                # Database schema & migrations
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- A PostgreSQL database with PostGIS enabled (local via Docker, or a hosted provider)
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
```

**`client/.env`**

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
AUTH_SECRET=your_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_random_secret  # must match server's exactly
NEXT_PUBLIC_SERVER_URL=http://localhost:3002
```

> `JWT_SECRET` must be identical on both client and server — it's how the client's minted tokens are verified by the Express API.

### 4. Run migrations

```bash
cd server
npx prisma migrate deploy
npx prisma generate

cd ../client
npx prisma generate
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

## Key Architectural Notes

- **Auth bridge:** Since the client (Next.js/NextAuth) and server (Express) are separate services, the client mints a short-lived JWT at `/api/auth/token` on demand, which Express verifies via custom middleware — this keeps the Express API stateless while still trusting the authenticated session.
- **Ownership checks:** All write endpoints (favorites, applications, lease status changes, profile updates) verify the requesting user actually owns the resource being modified, not just that they're authenticated.
- **No paid APIs:** Every third-party service used (Cloudinary, Nominatim, OpenStreetMap/Leaflet, NextAuth) has a genuinely free tier with no credit card required, replacing the AWS/Mapbox stack from the original tutorial this project was built from.

---

## License

This project is for educational/portfolio purposes.
