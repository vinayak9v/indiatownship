# IndiaTownship.com — Product Design Spec

**Date:** 2026-05-22  
**Status:** Approved  
**Source:** IndiaTownship_Requirement_Document.pdf + brainstorming session

---

## 1. Project Overview

**IndiaTownship.com** is a premium real estate listing and lead generation portal targeting Indore and Bhopal (expandable to pan-India). It serves three clients from a single Express API: a public Next.js website, a Next.js admin panel, and a React Native mobile app (Android + iOS).

**Business goal:** A 99acres/MagicBricks-quality portal, SEO-optimised, fast-loading, lead-generation focused. All property content is managed exclusively by admins. Public users browse, save, and inquire. Leads go to WhatsApp (instant alert) and the admin panel (tracking + follow-up).

---

## 2. System Architecture

### 2.1 Monorepo Structure

```
indiatownship/
├── apps/
│   ├── api/          ← Express.js REST API
│   ├── web/          ← Next.js 14 public portal (indiatownship.com)
│   ├── admin/        ← Next.js 14 admin panel (admin.indiatownship.com)
│   └── mobile/       ← React Native + Expo (Android + iOS)
└── packages/
    ├── types/        ← Shared TypeScript types
    └── ui/           ← Shared React components (web + admin)
```

Managed with **Turborepo** for unified build/lint/test pipelines.

### 2.2 Stack

| Layer       | Technology                        | Hosting              |
|-------------|-----------------------------------|----------------------|
| API         | Express.js + Mongoose + MongoDB   | Railway / VPS        |
| Web         | Next.js 14 (App Router, SSR/SSG)  | Vercel               |
| Admin       | Next.js 14                        | Vercel (subdomain)   |
| Mobile      | React Native + Expo               | App Store / Play Store |
| Database    | MongoDB (Atlas)                   | MongoDB Atlas        |
| Media       | Cloudinary                        | Cloudinary CDN       |
| Auth        | JWT (access + refresh tokens)     | —                    |
| Notifications | WhatsApp Business API (Meta)    | —                    |
| Maps        | Google Maps JavaScript API        | —                    |

### 2.3 Authentication

- **Primary:** Phone number + password
- **Fallback:** Email + password
- JWT issued on login: `accessToken` (15 min) + `refreshToken` (30 days)
- Web: tokens stored in httpOnly cookies
- Mobile: tokens stored in Expo SecureStore
- Admin panel uses the same auth system; `role: 'admin'` gates all admin routes

---

## 3. Data Models (MongoDB + Mongoose)

### 3.1 Property

```ts
{
  _id: ObjectId,
  title: string,
  slug: string,                  // SEO-friendly, auto-generated, unique
  description: string,
  
  // Classification
  listingType: 'buy' | 'rent',
  propertyType: 'flat' | 'villa' | 'house' | 'plot',
  projectCategory: 'new_launch' | 'ongoing' | 'ready_to_move',
  
  // Location
  city: 'indore' | 'bhopal',
  locality: string,              // e.g., "Vijay Nagar", "MP Nagar"
  address: string,
  coordinates: { lat: number, lng: number },
  
  // Details
  price: number,
  priceUnit: 'total' | 'per_sqft',
  size: number,
  sizeUnit: 'sqft' | 'sqyard' | 'acre',
  bedrooms: number,              // 0 = studio/plot
  bathrooms: number,
  facing: 'north' | 'south' | 'east' | 'west' | 'north_east' | ...,
  constructionStatus: 'under_construction' | 'ready_to_move' | 'new_launch',
  
  // Media
  images: [{
    url: string,                 // Cloudinary URL
    type: 'outdoor' | 'indoor' | 'floor_plan' | 'master_plan',
    caption: string,
  }],
  brochureUrl: string,           // Cloudinary PDF URL
  
  // Amenities
  amenities: string[],           // e.g., ["Swimming Pool", "Gym", "24/7 Security"]
  
  // Flags
  isFeatured: boolean,           // shown in Featured Projects slider
  isLuxury: boolean,             // shown in Luxury Properties section
  isActive: boolean,             // admin toggle (visible/hidden)
  
  // SEO
  metaTitle: string,
  metaDescription: string,
  
  createdAt: Date,
  updatedAt: Date,
}
```

### 3.2 User

```ts
{
  _id: ObjectId,
  name: string,
  phone: string,                 // unique, used as primary login
  email: string,                 // unique, used as fallback login
  passwordHash: string,
  role: 'user' | 'admin',
  savedProperties: ObjectId[],   // ref: Property
  alerts: [{
    city: 'indore' | 'bhopal' | 'all',
    listingType: 'buy' | 'rent' | 'any',
    propertyType: string,
    minPrice: number,
    maxPrice: number,
  }],
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### 3.3 Lead (Inquiry)

```ts
{
  _id: ObjectId,
  property: ObjectId,            // ref: Property
  
  // Contact info
  name: string,
  phone: string,
  email: string,
  message: string,
  
  // Source
  source: 'web' | 'mobile' | 'contact_page',
  
  // Status
  status: 'new' | 'contacted' | 'closed' | 'not_interested',
  adminNotes: string,
  
  // Delivery
  whatsappSent: boolean,
  whatsappSentAt: Date,
  
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 4. API Design (Express.js)

Base URL: `https://api.indiatownship.com/v1`

### 4.1 Auth Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register with phone+password or email+password |
| POST | `/auth/login` | Login with phone or email + password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |

### 4.2 Property Routes (Public)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/properties` | List with filters (city, type, price, bedrooms, etc.) |
| GET | `/properties/:slug` | Single property detail |
| GET | `/properties/featured` | Featured properties for homepage slider |
| GET | `/properties/luxury` | Luxury properties section |

Query params for list: `city`, `listingType`, `propertyType`, `projectCategory`, `minPrice`, `maxPrice`, `bedrooms`, `facing`, `constructionStatus`, `page`, `limit`, `sort`

### 4.3 Lead Routes (Public)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/leads` | Submit property inquiry (triggers WhatsApp notification) |
| POST | `/contact` | General contact form submission |

### 4.4 User Routes (Authenticated)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update profile |
| POST | `/users/me/saved/:propertyId` | Save a property |
| DELETE | `/users/me/saved/:propertyId` | Unsave a property |
| GET | `/users/me/saved` | List saved properties |
| POST | `/users/me/alerts` | Create property alert |
| DELETE | `/users/me/alerts/:alertId` | Delete alert |

### 4.5 Admin Routes (Admin only)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/admin/properties` | Create property |
| PATCH | `/admin/properties/:id` | Update property |
| DELETE | `/admin/properties/:id` | Delete property |
| PATCH | `/admin/properties/:id/toggle` | Activate/deactivate |
| GET | `/admin/leads` | List all leads with filters |
| PATCH | `/admin/leads/:id` | Update lead status + notes |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id` | Update user (activate/deactivate) |
| GET | `/admin/analytics` | Dashboard stats |

### 4.6 WhatsApp Notification Flow

On every `POST /leads` submission:
1. Lead saved to MongoDB
2. API calls WhatsApp Business API (Meta) to send a message to the admin WhatsApp number
3. Message contains: property title, lead name, phone, email, message
4. `whatsappSent: true` recorded on the lead document
5. If WhatsApp call fails, lead is still saved; admin sees it in panel

---

## 5. Public Website (Next.js)

### 5.1 URL Structure

```
/                                   ← Homepage
/buy/indore                         ← Buy in Indore listing
/buy/bhopal                         ← Buy in Bhopal listing
/rent/indore                        ← Rent in Indore
/rent/bhopal                        ← Rent in Bhopal
/plots/indore                       ← Plots in Indore
/plots/bhopal
/projects/new-launch               ← New launch projects
/projects/ongoing                  ← Ongoing projects
/projects/ready-to-move            ← Ready to move
/property/[slug]                   ← Property detail page
/sell                              ← Sell page (static + contact form)
/about                             ← About Us
/contact                           ← Contact Us
```

### 5.2 Homepage Sections

1. **Hero Search** — full-width banner with Buy/Rent/Sell tabs, search by city/locality/keyword, prominent CTA button
2. **Featured Projects Slider** — carousel of `isFeatured: true` properties with image, price, location
3. **Luxury Properties Section** — grid of `isLuxury: true` properties
4. **Top Residential Projects** — curated picks by project category
5. **Search by City** — Indore / Bhopal quick-select cards
6. **Why IndiaTownship** — trust signals (verified listings, expert team, etc.)
7. **Footer** — links, contact info, social media

### 5.3 Property Listing Page

- Filter sidebar: budget range, property type, bedrooms, facing, construction status
- Sort: price low/high, newest, area
- Paginated grid of property cards (image, title, price, locality, BHK, size)
- Map view toggle (Google Maps with property pins)
- SEO: `<h1>` = "Buy Flats in Indore", meta title/description per page

### 5.4 Property Detail Page

- **Gallery** — lightbox with outdoor, indoor, floor plan, master plan tabs
- **Overview** — price, size, bedrooms, bathrooms, facing, status, locality
- **Amenities** — icon grid
- **Location** — embedded Google Map
- **Construction Status** — progress indicator
- **Download Brochure** — Cloudinary PDF download (gated: requires phone number)
- **Inquiry Form** — name, phone, email, message → `POST /leads`
- **WhatsApp CTA** — "Chat on WhatsApp" button (direct link to admin WhatsApp)
- **Similar Properties** — same city + type carousel

### 5.5 Rendering Strategy

| Page | Strategy | Why |
|------|----------|-----|
| Homepage | ISR (revalidate: 3600) | Fresh featured listings hourly |
| Listing pages | SSR | Real-time filter results |
| Property detail | ISR (revalidate: 1800) | Fresh but cached |
| Static pages (about, contact, sell) | SSG | No dynamic data |

### 5.6 Design System

- **Theme:** White background, Dark Navy (`#0A1F44`), Gold accent (`#C9A84C`)
- **Font:** Inter (body) + Playfair Display (headings) — premium real estate feel
- **Mobile-first responsive** — Tailwind CSS
- **Components:** property card, search bar, filter panel, inquiry form, gallery lightbox, map embed

---

## 6. Admin Panel (Next.js)

Hosted at `admin.indiatownship.com`. Accessible only to `role: 'admin'` users.

### 6.1 Pages

| Page | Purpose |
|------|---------|
| `/dashboard` | Stats: total properties, new leads today, total users, leads by status |
| `/properties` | Table: all properties, search, filter, activate/deactivate toggle |
| `/properties/new` | Create property form (all fields + image upload to Cloudinary) |
| `/properties/[id]/edit` | Edit property |
| `/leads` | Lead table: name, phone, property, status, date. Filter by status/city/date |
| `/leads/[id]` | Lead detail: full info, status update dropdown, admin notes |
| `/users` | User list: name, phone, email, joined date, activate/deactivate |
| `/settings` | Admin WhatsApp number, site settings |

### 6.2 Lead Management Workflow

1. New lead arrives → status = `new`, WhatsApp sent to admin
2. Admin opens lead in panel → changes status to `contacted`
3. Admin adds notes (call outcome, follow-up date)
4. Lead marked `closed` (deal done) or `not_interested`
5. Dashboard shows leads by status as a pipeline

### 6.3 Property Image Upload

- Admin uploads images directly from the form
- Images sent to Cloudinary via signed upload preset
- Multiple images supported; drag-to-reorder for gallery sequence
- Brochure uploaded as PDF to Cloudinary

---

## 7. Mobile App (React Native + Expo)

### 7.1 Screens

```
Tab Navigator:
├── Home          ← Homepage equivalent (search, featured, luxury)
├── Search        ← Full filter search
├── Saved         ← Saved properties (requires login)
└── Profile       ← Login/register, alerts, settings

Stack screens:
├── Property Detail
├── Inquiry Form
├── Login / Register
└── Alert Setup
```

### 7.2 Mobile-Specific Features

- **Push Notifications** (Expo Notifications) — property alert matches
- **WhatsApp Deep Link** — taps "Chat on WhatsApp" opens WhatsApp app directly
- **Call CTA** — tap-to-call admin phone number from property detail
- **Brochure Download** — opens PDF in device viewer after phone number gate
- **Offline saved list** — saved properties cached locally with AsyncStorage

### 7.3 API Integration

Same Express API as web. Mobile passes JWT in `Authorization: Bearer` header. Expo SecureStore for token persistence.

---

## 8. SEO Strategy

### 8.1 URL Convention

```
/buy/indore/flats
/buy/indore/villas
/rent/bhopal/flats
/plots/indore
/property/3bhk-flat-vijay-nagar-indore-abc123
```

All property slugs: `{bedrooms}bhk-{type}-{locality}-{city}-{shortId}`

### 8.2 Per-Page SEO

- Dynamic `<title>` and `<meta name="description">` on every page
- Open Graph tags for property sharing on WhatsApp/social
- Canonical URLs to avoid duplicate content
- JSON-LD structured data (`RealEstateListing` schema) on property detail pages
- `robots.txt` — allow all public pages, disallow `/admin`
- XML sitemap auto-generated and submitted to Google Search Console

### 8.3 Performance

- Next.js Image component with Cloudinary loader (auto WebP, responsive sizes)
- ISR for property pages — no per-request DB calls for most traffic
- Core Web Vitals target: LCP < 2.5s, CLS < 0.1, FID < 100ms

---

## 9. Lead Generation Flows

### 9.1 Property Inquiry (primary)

1. User views property detail → fills inquiry form → `POST /leads`
2. API saves lead → triggers WhatsApp message to admin number
3. Admin gets WhatsApp: "New Inquiry: [Name] | [Phone] | [Property Title] | [Message]"
4. Admin opens panel to track follow-up

### 9.2 Brochure Download Gate

1. User clicks "Download Brochure" → modal asks for phone number
2. Phone saved as a lightweight lead (source: `brochure_gate`)
3. Brochure PDF URL returned → browser downloads from Cloudinary

### 9.3 Property Alerts

1. Logged-in user sets alert (city, type, price range)
2. When admin adds a new matching property → alert job runs → push notification (mobile) or email notification (web)
3. Alert job runs on property creation via a background worker (Bull queue or simple cron)

---

## 10. Required Pages Summary

| Page | Type | Notes |
|------|------|-------|
| Home | ISR | Hero, featured, luxury, top projects |
| Buy Property (/buy/:city) | SSR | Filterable listing |
| Rent Property (/rent/:city) | SSR | Filterable listing |
| Plots (/plots/:city) | SSR | Filterable listing |
| New Launch (/projects/new-launch) | SSR | Project category filter |
| Ongoing (/projects/ongoing) | SSR | |
| Ready To Move (/projects/ready-to-move) | SSR | |
| Property Detail (/property/:slug) | ISR | Full detail, gallery, inquiry |
| Sell Property (/sell) | SSG | Static + contact form |
| About Us (/about) | SSG | |
| Contact Us (/contact) | SSG | Contact form → lead |

---

## 11. Future Scope (Out of Current Spec)

- Commercial Properties
- Property Management module
- AI Property Recommendation (based on user browse history)
- Home Loan Section (partner integrations)
- Interior Services
- Pan-India city expansion
- Dealer/Agent portal (with admin-approval workflow)

---

## 12. Open Questions / Decisions Made

| Decision | Choice |
|----------|--------|
| Backend | Express.js |
| Frontend | Next.js 14 (App Router) |
| Mobile | React Native + Expo |
| Database | MongoDB + Mongoose |
| Media | Cloudinary |
| Auth | JWT, phone+password primary / email+password fallback |
| Property posting | Admin-only (no public submission form) |
| Lead delivery | WhatsApp Business API + admin panel |
| Cities at launch | Indore + Bhopal |
| Monorepo | Turborepo |
