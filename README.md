# IndiaTownship

Real estate platform for Indore & Bhopal — property listings, search, and lead management.

## Apps

| App | Stack | Port |
|-----|-------|------|
| `apps/api` | Express + MongoDB | 3001 |
| `apps/web` | Next.js 14 (public site) | 3000 |
| `apps/admin` | Next.js 14 (admin panel) | 3002 |
| `apps/mobile` | React Native + Expo SDK 51 | — |

## Prerequisites

- Node.js >= 20
- npm >= 10
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`) — for mobile only

## Setup

```bash
# 1. Clone
git clone https://github.com/vinayak9v/indiatownship.git
cd indiatownship

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in MongoDB URI, JWT secrets, Cloudinary, and WhatsApp keys in .env
```

## Running locally

```bash
# All apps (api + web + admin) in parallel
npm run dev

# Individual apps
cd apps/api   && npm run dev   # API on :3001
cd apps/web   && npm run dev   # Web on :3000
cd apps/admin && npm run dev   # Admin on :3002

# Mobile
cd apps/mobile
npm install
npx expo start
```

## Environment variables

Copy `.env.example` to `.env` at the root. Key variables to fill in:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | 64-char random string |
| `JWT_REFRESH_SECRET` | 64-char random string (different from above) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta WhatsApp Business phone ID |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp access token |
| `WHATSAPP_ADMIN_NUMBER` | Admin WhatsApp number for lead alerts |

## Building & testing

```bash
npm run build    # Build all apps
npm run test     # Run all tests (47 API tests)
npm run lint     # Lint all apps
```

## Docker (production)

```bash
docker-compose up --build
```

Nginx routes:
- `indiatownship.com` → web
- `api.indiatownship.com` → api
- `admin.indiatownship.com` → admin

## Project structure

```
indiatownship/
├── apps/
│   ├── api/        # Express REST API
│   ├── web/        # Public-facing Next.js site
│   ├── admin/      # Admin dashboard
│   └── mobile/     # React Native app
├── packages/
│   └── types/      # Shared TypeScript types
├── infra/
│   ├── nginx/      # Nginx config
│   └── scripts/    # Server setup & deploy scripts
└── docker-compose.yml
```

## Tech stack

- **API:** Express, MongoDB/Mongoose, JWT auth, Cloudinary, WhatsApp Business API
- **Web/Admin:** Next.js 14, Tailwind CSS, httpOnly cookie auth
- **Mobile:** React Native, Expo SDK 51, Expo SecureStore
- **Infra:** Docker, Nginx, GitHub Actions CI/CD
- **Monorepo:** Turborepo + npm workspaces
