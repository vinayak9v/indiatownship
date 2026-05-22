# IndiaTownship.com — Plan 1: Foundation + Express API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Turborepo monorepo, shared TypeScript types package, and Express.js REST API with MongoDB — the single backend serving the website, admin panel, and mobile app.

**Architecture:** Turborepo monorepo with `packages/types` (shared TS interfaces) and `apps/api` (Express). API uses a layered controller→service→model architecture. JWT auth, Mongoose schemas, WhatsApp Business API for lead notifications, Cloudinary for media. All routes tested with Jest + Supertest + mongodb-memory-server.

**Tech Stack:** Node.js 20, Express 4, TypeScript 5, Mongoose 8, MongoDB Atlas, jsonwebtoken, bcryptjs, Cloudinary SDK v2, WhatsApp Business API (Meta Graph API v18), Jest, Supertest, mongodb-memory-server, Turborepo 2

> **Plans 2–4** (Next.js Web, Next.js Admin, React Native) are separate plan documents and depend on this API being complete.

---

## File Map

```
indiatownship/
├── package.json                              # Turborepo root + workspaces
├── turbo.json                                # Pipeline config
├── .gitignore
├── packages/
│   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── property.ts                   # IProperty, enums
│           ├── user.ts                       # IUser, UserAlert
│           ├── lead.ts                       # ILead, enums
│           └── index.ts                      # barrel export
└── apps/
    └── api/
        ├── package.json
        ├── tsconfig.json
        ├── jest.config.ts
        ├── .env.example
        └── src/
            ├── index.ts                      # Express app entry, route wiring
            ├── app.ts                        # Express app factory (testable)
            ├── config/
            │   ├── env.ts                    # Validated env vars
            │   └── db.ts                     # Mongoose connect/disconnect
            ├── models/
            │   ├── Property.ts               # Mongoose schema + model
            │   ├── User.ts
            │   └── Lead.ts
            ├── middleware/
            │   ├── auth.ts                   # requireAuth (JWT verify)
            │   ├── adminOnly.ts              # requireAdmin (role check)
            │   └── errorHandler.ts           # Global error handler
            ├── services/
            │   ├── auth.service.ts           # hashPassword, comparePassword, signTokens, verifyToken
            │   ├── property.service.ts       # list (with filters), getBySlug, featured, luxury, CRUD
            │   ├── lead.service.ts           # createLead (saves + triggers WhatsApp)
            │   ├── whatsapp.service.ts       # Meta Graph API call
            │   ├── cloudinary.service.ts     # signed upload, delete
            │   └── alert.service.ts          # match new property against user alerts
            ├── controllers/
            │   ├── auth.controller.ts
            │   ├── property.controller.ts
            │   ├── lead.controller.ts
            │   ├── user.controller.ts
            │   └── admin.controller.ts
            ├── routes/
            │   ├── auth.routes.ts
            │   ├── property.routes.ts
            │   ├── lead.routes.ts
            │   ├── user.routes.ts
            │   └── admin.routes.ts
            └── utils/
                ├── slug.ts                   # generateSlug(property)
                └── paginate.ts               # parsePagination(query)
        └── tests/
            ├── helpers/
            │   └── db.ts                     # mongodb-memory-server setup/teardown
            ├── auth.test.ts
            ├── property.test.ts
            ├── lead.test.ts
            ├── user.test.ts
            └── admin.test.ts
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.nvmrc`

- [ ] **Step 1: Initialise git and root package.json**

```bash
cd /Users/vinayak/indiatownship
git init
```

Create `package.json`:
```json
{
  "name": "indiatownship",
  "version": "0.0.1",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "engines": { "node": ">=20.0.0" }
}
```

- [ ] **Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

- [ ] **Step 3: Create .gitignore and .nvmrc**

`.gitignore`:
```
node_modules/
dist/
.env
.env.local
.turbo/
.next/
*.log
.superpowers/
```

`.nvmrc`:
```
20
```

- [ ] **Step 4: Install root dependencies**

```bash
npm install
```

Expected output: `added N packages`

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: init turborepo monorepo"
```

---

## Task 2: Shared Types Package

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/property.ts`
- Create: `packages/types/src/user.ts`
- Create: `packages/types/src/lead.ts`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create package scaffold**

`packages/types/package.json`:
```json
{
  "name": "@indiatownship/types",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

`packages/types/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Write property types**

`packages/types/src/property.ts`:
```typescript
export type ListingType = 'buy' | 'rent';
export type PropertyType = 'flat' | 'villa' | 'house' | 'plot';
export type ProjectCategory = 'new_launch' | 'ongoing' | 'ready_to_move';
export type City = 'indore' | 'bhopal';
export type Facing =
  | 'north' | 'south' | 'east' | 'west'
  | 'north_east' | 'north_west' | 'south_east' | 'south_west';
export type ConstructionStatus = 'under_construction' | 'ready_to_move' | 'new_launch';
export type ImageType = 'outdoor' | 'indoor' | 'floor_plan' | 'master_plan';
export type PriceUnit = 'total' | 'per_sqft';
export type SizeUnit = 'sqft' | 'sqyard' | 'acre';

export interface PropertyImage {
  url: string;
  type: ImageType;
  caption: string;
}

export interface IProperty {
  _id: string;
  title: string;
  slug: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  projectCategory: ProjectCategory;
  city: City;
  locality: string;
  address: string;
  coordinates: { lat: number; lng: number };
  price: number;
  priceUnit: PriceUnit;
  size: number;
  sizeUnit: SizeUnit;
  bedrooms: number;
  bathrooms: number;
  facing: Facing;
  constructionStatus: ConstructionStatus;
  images: PropertyImage[];
  brochureUrl: string;
  amenities: string[];
  isFeatured: boolean;
  isLuxury: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  city?: City;
  listingType?: ListingType;
  propertyType?: PropertyType;
  projectCategory?: ProjectCategory;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  facing?: Facing;
  constructionStatus?: ConstructionStatus;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'area_desc';
}
```

- [ ] **Step 3: Write user types**

`packages/types/src/user.ts`:
```typescript
import { City, ListingType, PropertyType } from './property';

export interface UserAlert {
  _id?: string;
  city: City | 'all';
  listingType: ListingType | 'any';
  propertyType: PropertyType | 'any';
  minPrice: number;
  maxPrice: number;
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: 'user' | 'admin';
  savedProperties: string[];
  alerts: UserAlert[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 4: Write lead types**

`packages/types/src/lead.ts`:
```typescript
export type LeadStatus = 'new' | 'contacted' | 'closed' | 'not_interested';
export type LeadSource = 'web' | 'mobile' | 'contact_page' | 'brochure_gate';

export interface ILead {
  _id: string;
  property: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  adminNotes: string;
  whatsappSent: boolean;
  whatsappSentAt: string;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 5: Create barrel export**

`packages/types/src/index.ts`:
```typescript
export * from './property';
export * from './user';
export * from './lead';
```

- [ ] **Step 6: Verify types compile**

```bash
cd packages/types && npx tsc --noEmit
```

Expected: no output (zero errors)

- [ ] **Step 7: Commit**

```bash
cd /Users/vinayak/indiatownship
git add packages/types
git commit -m "feat: add shared TypeScript types package"
```

---

## Task 3: API Project Bootstrap

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/jest.config.ts`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@indiatownship/api",
  "version": "0.0.1",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest --runInBand --forceExit"
  },
  "dependencies": {
    "@indiatownship/types": "*",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.2.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.0",
    "morgan": "^1.10.0",
    "slugify": "^1.6.6"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.12.0",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^9.2.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

`apps/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create jest.config.ts**

`apps/api/jest.config.ts`:
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@indiatownship/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  setupFilesAfterFramework: [],
  testTimeout: 30000,
};

export default config;
```

- [ ] **Step 4: Create .env.example**

`apps/api/.env.example`:
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/indiatownship
JWT_SECRET=change-me-in-production-min-32-chars
JWT_REFRESH_SECRET=change-me-refresh-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_ADMIN_NUMBER=91XXXXXXXXXX
ADMIN_WHATSAPP_NUMBER=91XXXXXXXXXX
```

Copy it to `.env` and fill in values before running.

- [ ] **Step 5: Create src/config/env.ts**

`apps/api/src/config/env.ts`:
```typescript
import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
    adminNumber: process.env.WHATSAPP_ADMIN_NUMBER ?? '',
  },
};
```

- [ ] **Step 6: Create src/app.ts (Express factory)**

`apps/api/src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'silent' : 'dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Routes registered in index.ts after DB connects
  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 7: Create src/index.ts**

`apps/api/src/index.ts`:
```typescript
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDb();

  const app = createApp();

  // Route registration (filled in as routes are built)
  const { authRouter } = await import('./routes/auth.routes');
  const { propertyRouter } = await import('./routes/property.routes');
  const { leadRouter } = await import('./routes/lead.routes');
  const { userRouter } = await import('./routes/user.routes');
  const { adminRouter } = await import('./routes/admin.routes');

  app.use('/v1/auth', authRouter);
  app.use('/v1/properties', propertyRouter);
  app.use('/v1/leads', leadRouter);
  app.use('/v1/users', userRouter);
  app.use('/v1/admin', adminRouter);

  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
```

- [ ] **Step 8: Install dependencies**

```bash
cd apps/api && npm install
```

Expected: `added N packages`

- [ ] **Step 9: Verify TypeScript compiles**

```bash
cd apps/api && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 10: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api
git commit -m "chore: bootstrap API project (Express + TS + Jest)"
```

---

## Task 4: MongoDB Connection + Test Helper

**Files:**
- Create: `apps/api/src/config/db.ts`
- Create: `apps/api/tests/helpers/db.ts`

- [ ] **Step 1: Write a failing test for DB connection**

`apps/api/tests/helpers/db.ts`:
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export async function connectTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function disconnectTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
```

Now write a test that uses this helper. Create `apps/api/tests/db.test.ts`:
```typescript
import { connectTestDb, disconnectTestDb } from './helpers/db';
import mongoose from 'mongoose';

describe('DB helper', () => {
  beforeAll(connectTestDb);
  afterAll(disconnectTestDb);

  it('connects to in-memory MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (db.ts not created yet)**

```bash
cd apps/api && npm test -- --testPathPattern=db.test
```

Expected: FAIL — `Cannot find module '../config/db'` or similar

- [ ] **Step 3: Create src/config/db.ts**

```typescript
import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<void> {
  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
  await mongoose.connect(env.mongoUri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.connection.close();
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=db.test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/config/db.ts apps/api/tests/
git commit -m "feat: MongoDB connection + test helper"
```

---

## Task 5: Mongoose Models

**Files:**
- Create: `apps/api/src/models/Property.ts`
- Create: `apps/api/src/models/User.ts`
- Create: `apps/api/src/models/Lead.ts`

- [ ] **Step 1: Write failing model tests**

`apps/api/tests/models.test.ts`:
```typescript
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { PropertyModel } from '../src/models/Property';
import { UserModel } from '../src/models/User';
import { LeadModel } from '../src/models/Lead';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
afterEach(clearCollections);

describe('PropertyModel', () => {
  it('saves a property and auto-generates timestamps', async () => {
    const p = await PropertyModel.create({
      title: 'Test Flat',
      slug: 'test-flat-indore-abc1',
      description: 'A test flat',
      listingType: 'buy',
      propertyType: 'flat',
      projectCategory: 'ready_to_move',
      city: 'indore',
      locality: 'Vijay Nagar',
      address: '123 Test St',
      coordinates: { lat: 22.7196, lng: 75.8577 },
      price: 5000000,
      priceUnit: 'total',
      size: 1200,
      sizeUnit: 'sqft',
      bedrooms: 3,
      bathrooms: 2,
      facing: 'east',
      constructionStatus: 'ready_to_move',
      amenities: ['Gym', 'Parking'],
    });
    expect(p._id).toBeDefined();
    expect(p.isFeatured).toBe(false);
    expect(p.isLuxury).toBe(false);
    expect(p.isActive).toBe(true);
    expect(p.createdAt).toBeDefined();
  });

  it('requires title', async () => {
    await expect(
      PropertyModel.create({ slug: 'x', listingType: 'buy' })
    ).rejects.toThrow(/title/);
  });
});

describe('UserModel', () => {
  it('saves a user with hashed password placeholder', async () => {
    const u = await UserModel.create({
      name: 'Test User',
      phone: '9876543210',
      email: 'test@example.com',
      passwordHash: 'hashedpw',
      role: 'user',
    });
    expect(u._id).toBeDefined();
    expect(u.role).toBe('user');
    expect(u.isActive).toBe(true);
    expect(u.savedProperties).toEqual([]);
  });

  it('enforces unique phone', async () => {
    await UserModel.create({ name: 'A', phone: '9999999999', email: 'a@a.com', passwordHash: 'x' });
    await expect(
      UserModel.create({ name: 'B', phone: '9999999999', email: 'b@b.com', passwordHash: 'x' })
    ).rejects.toThrow(/duplicate|unique/i);
  });
});

describe('LeadModel', () => {
  it('saves a lead with default status new', async () => {
    const prop = await PropertyModel.create({
      title: 'Flat', slug: 'flat-indore-x1', description: 'd',
      listingType: 'buy', propertyType: 'flat', projectCategory: 'ready_to_move',
      city: 'indore', locality: 'L', address: 'A',
      coordinates: { lat: 0, lng: 0 }, price: 1, priceUnit: 'total',
      size: 1, sizeUnit: 'sqft', bedrooms: 1, bathrooms: 1,
      facing: 'east', constructionStatus: 'ready_to_move',
    });
    const lead = await LeadModel.create({
      property: prop._id,
      name: 'Buyer',
      phone: '9876543210',
      email: 'buyer@example.com',
      message: 'Interested',
      source: 'web',
    });
    expect(lead.status).toBe('new');
    expect(lead.whatsappSent).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=models.test
```

Expected: FAIL — model files don't exist

- [ ] **Step 3: Create Property model**

`apps/api/src/models/Property.ts`:
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import type {
  ListingType, PropertyType, ProjectCategory, City,
  Facing, ConstructionStatus, PropertyImage, PriceUnit, SizeUnit,
} from '@indiatownship/types';

export interface PropertyDoc extends Document {
  title: string;
  slug: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  projectCategory: ProjectCategory;
  city: City;
  locality: string;
  address: string;
  coordinates: { lat: number; lng: number };
  price: number;
  priceUnit: PriceUnit;
  size: number;
  sizeUnit: SizeUnit;
  bedrooms: number;
  bathrooms: number;
  facing: Facing;
  constructionStatus: ConstructionStatus;
  images: PropertyImage[];
  brochureUrl: string;
  amenities: string[];
  isFeatured: boolean;
  isLuxury: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<PropertyDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    listingType: { type: String, enum: ['buy', 'rent'], required: true },
    propertyType: { type: String, enum: ['flat', 'villa', 'house', 'plot'], required: true },
    projectCategory: { type: String, enum: ['new_launch', 'ongoing', 'ready_to_move'], required: true },
    city: { type: String, enum: ['indore', 'bhopal'], required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['total', 'per_sqft'], default: 'total' },
    size: { type: Number, required: true },
    sizeUnit: { type: String, enum: ['sqft', 'sqyard', 'acre'], default: 'sqft' },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    facing: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west'],
    },
    constructionStatus: {
      type: String,
      enum: ['under_construction', 'ready_to_move', 'new_launch'],
      required: true,
    },
    images: [
      {
        url: String,
        type: { type: String, enum: ['outdoor', 'indoor', 'floor_plan', 'master_plan'] },
        caption: { type: String, default: '' },
      },
    ],
    brochureUrl: { type: String, default: '' },
    amenities: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isLuxury: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

PropertySchema.index({ city: 1, listingType: 1, propertyType: 1 });
PropertySchema.index({ slug: 1 }, { unique: true });
PropertySchema.index({ isFeatured: 1, isActive: 1 });

export const PropertyModel = mongoose.model<PropertyDoc>('Property', PropertySchema);
```

- [ ] **Step 4: Create User model**

`apps/api/src/models/User.ts`:
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface AlertDoc {
  _id: mongoose.Types.ObjectId;
  city: 'indore' | 'bhopal' | 'all';
  listingType: 'buy' | 'rent' | 'any';
  propertyType: string;
  minPrice: number;
  maxPrice: number;
}

export interface UserDoc extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  savedProperties: mongoose.Types.ObjectId[];
  alerts: AlertDoc[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<AlertDoc>({
  city: { type: String, enum: ['indore', 'bhopal', 'all'], default: 'all' },
  listingType: { type: String, enum: ['buy', 'rent', 'any'], default: 'any' },
  propertyType: { type: String, default: 'any' },
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: 999999999 },
});

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    alerts: [AlertSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDoc>('User', UserSchema);
```

- [ ] **Step 5: Create Lead model**

`apps/api/src/models/Lead.ts`:
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import type { LeadStatus, LeadSource } from '@indiatownship/types';

export interface LeadDoc extends Document {
  property: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  adminNotes: string;
  whatsappSent: boolean;
  whatsappSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<LeadDoc>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    message: { type: String, default: '' },
    source: {
      type: String,
      enum: ['web', 'mobile', 'contact_page', 'brochure_gate'],
      default: 'web',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed', 'not_interested'],
      default: 'new',
    },
    adminNotes: { type: String, default: '' },
    whatsappSent: { type: Boolean, default: false },
    whatsappSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ property: 1 });

export const LeadModel = mongoose.model<LeadDoc>('Lead', LeadSchema);
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=models.test
```

Expected: PASS (5 tests)

- [ ] **Step 7: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/models apps/api/tests/models.test.ts
git commit -m "feat: add Mongoose models for Property, User, Lead"
```

---

## Task 6: Auth Service

**Files:**
- Create: `apps/api/src/services/auth.service.ts`
- Test: `apps/api/tests/auth.service.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/api/tests/auth.service.test.ts`:
```typescript
import { hashPassword, comparePassword, signTokens, verifyAccessToken } from '../src/services/auth.service';

describe('hashPassword', () => {
  it('returns a bcrypt hash different from the input', async () => {
    const hash = await hashPassword('mypassword123');
    expect(hash).not.toBe('mypassword123');
    expect(hash.startsWith('$2')).toBe(true);
  });
});

describe('comparePassword', () => {
  it('returns true for matching password', async () => {
    const hash = await hashPassword('secret');
    expect(await comparePassword('secret', hash)).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('secret');
    expect(await comparePassword('wrong', hash)).toBe(false);
  });
});

describe('signTokens + verifyAccessToken', () => {
  it('signs and verifies a token round-trip', () => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!!';
    const { accessToken } = signTokens({ userId: 'abc123', role: 'user' });
    const payload = verifyAccessToken(accessToken);
    expect(payload.userId).toBe('abc123');
    expect(payload.role).toBe('user');
  });

  it('throws on invalid token', () => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
    expect(() => verifyAccessToken('bad.token.here')).toThrow();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=auth.service
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement auth service**

`apps/api/src/services/auth.service.ts`:
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

export function signTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtAccessExpires as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpires as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=auth.service
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/services/auth.service.ts apps/api/tests/auth.service.test.ts
git commit -m "feat: auth service (bcrypt + JWT)"
```

---

## Task 7: Middleware (auth, adminOnly, errorHandler)

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/adminOnly.ts`
- Create: `apps/api/src/middleware/errorHandler.ts`

- [ ] **Step 1: Create requireAuth middleware**

`apps/api/src/middleware/auth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

- [ ] **Step 2: Create requireAdmin middleware**

`apps/api/src/middleware/adminOnly.ts`:
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
```

- [ ] **Step 3: Create errorHandler middleware**

`apps/api/src/middleware/errorHandler.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  res.status(status).json({ error: message });
}

export function createError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd apps/api && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/middleware
git commit -m "feat: add auth, adminOnly, errorHandler middleware"
```

---

## Task 8: Auth Routes (register, login, refresh, logout)

**Files:**
- Create: `apps/api/src/controllers/auth.controller.ts`
- Create: `apps/api/src/routes/auth.routes.ts`
- Test: `apps/api/tests/auth.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/api/tests/auth.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../src/app';
import { authRouter } from '../src/routes/auth.routes';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { errorHandler } from '../src/middleware/errorHandler';

const app = createApp();
app.use('/v1/auth', authRouter);
app.use(errorHandler);

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
afterEach(clearCollections);

describe('POST /v1/auth/register', () => {
  it('registers a user with phone + password', async () => {
    const res = await request(app).post('/v1/auth/register').send({
      name: 'Raj Sharma',
      phone: '9876543210',
      password: 'securepass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.phone).toBe('9876543210');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('registers a user with email + password', async () => {
    const res = await request(app).post('/v1/auth/register').send({
      name: 'Priya Jain',
      email: 'priya@example.com',
      password: 'securepass456',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('priya@example.com');
  });

  it('rejects registration with neither phone nor email', async () => {
    const res = await request(app).post('/v1/auth/register').send({
      name: 'Ghost',
      password: 'somepass',
    });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate phone', async () => {
    await request(app).post('/v1/auth/register').send({
      name: 'A', phone: '9111111111', password: 'pass1234',
    });
    const res = await request(app).post('/v1/auth/register').send({
      name: 'B', phone: '9111111111', password: 'pass1234',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/v1/auth/register').send({
      name: 'Login Test', phone: '9000000001', password: 'mypassword',
    });
  });

  it('logs in with correct phone + password', async () => {
    const res = await request(app).post('/v1/auth/login').send({
      phone: '9000000001', password: 'mypassword',
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/v1/auth/login').send({
      phone: '9000000001', password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('rejects unknown phone', async () => {
    const res = await request(app).post('/v1/auth/login').send({
      phone: '9999999999', password: 'anything',
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/auth/refresh', () => {
  it('returns new access token given valid refresh token', async () => {
    const reg = await request(app).post('/v1/auth/register').send({
      name: 'Refresh User', phone: '9000000002', password: 'pass1234',
    });
    const res = await request(app).post('/v1/auth/refresh').send({
      refreshToken: reg.body.refreshToken,
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejects invalid refresh token', async () => {
    const res = await request(app).post('/v1/auth/refresh').send({
      refreshToken: 'garbage',
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=auth.test
```

Expected: FAIL

- [ ] **Step 3: Implement auth controller**

`apps/api/src/controllers/auth.controller.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword, signTokens, verifyRefreshToken } from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

function sanitizeUser(user: InstanceType<typeof UserModel>) {
  const obj = user.toObject() as Record<string, unknown>;
  delete obj.passwordHash;
  return obj;
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !password) return next(createError('name and password are required', 400));
    if (!phone && !email) return next(createError('phone or email is required', 400));

    const passwordHash = await hashPassword(password);
    const userData: Record<string, unknown> = { name, passwordHash };
    if (phone) userData.phone = phone;
    if (email) userData.email = email;

    let user;
    try {
      user = await UserModel.create(userData);
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 11000) return next(createError('Phone or email already registered', 409));
      throw err;
    }

    const { accessToken, refreshToken } = signTokens({ userId: String(user._id), role: user.role });
    res.status(201).json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, email, password } = req.body;
    if (!password || (!phone && !email)) return next(createError('Credentials required', 400));

    const query = phone ? { phone } : { email };
    const user = await UserModel.findOne(query);
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return next(createError('Invalid credentials', 401));
    }
    if (!user.isActive) return next(createError('Account deactivated', 403));

    const { accessToken, refreshToken } = signTokens({ userId: String(user._id), role: user.role });
    res.json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError('refreshToken required', 400));
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return next(createError('Invalid or expired refresh token', 401));
    }
    const { accessToken, refreshToken: newRefresh } = signTokens({
      userId: payload.userId,
      role: payload.role,
    });
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response) {
  // JWT is stateless; client discards the token.
  // For refresh token invalidation, add a denylist here in the future.
  res.json({ message: 'Logged out' });
}
```

- [ ] **Step 4: Create auth router**

`apps/api/src/routes/auth.routes.ts`:
```typescript
import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
```

- [ ] **Step 5: Run — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=auth.test
```

Expected: PASS (9 tests)

- [ ] **Step 6: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/controllers/auth.controller.ts apps/api/src/routes/auth.routes.ts apps/api/tests/auth.test.ts
git commit -m "feat: auth routes (register, login, refresh, logout)"
```

---

## Task 9: Slug Utility + Property Service + Public Routes

**Files:**
- Create: `apps/api/src/utils/slug.ts`
- Create: `apps/api/src/utils/paginate.ts`
- Create: `apps/api/src/services/property.service.ts`
- Create: `apps/api/src/controllers/property.controller.ts`
- Create: `apps/api/src/routes/property.routes.ts`
- Test: `apps/api/tests/property.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/api/tests/property.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../src/app';
import { propertyRouter } from '../src/routes/property.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { PropertyModel } from '../src/models/Property';

const app = createApp();
app.use('/v1/properties', propertyRouter);
app.use(errorHandler);

const sampleProps = [
  {
    title: '3BHK Flat Vijay Nagar', slug: '3bhk-flat-vijay-nagar-indore-a1',
    description: 'Spacious flat', listingType: 'buy', propertyType: 'flat',
    projectCategory: 'ready_to_move', city: 'indore', locality: 'Vijay Nagar',
    address: '10 MG Road', coordinates: { lat: 22.7, lng: 75.8 },
    price: 5000000, priceUnit: 'total', size: 1200, sizeUnit: 'sqft',
    bedrooms: 3, bathrooms: 2, facing: 'east', constructionStatus: 'ready_to_move',
    isFeatured: true, isLuxury: false, isActive: true,
  },
  {
    title: 'Luxury Villa MP Nagar', slug: 'luxury-villa-mp-nagar-bhopal-b2',
    description: 'Premium villa', listingType: 'buy', propertyType: 'villa',
    projectCategory: 'ready_to_move', city: 'bhopal', locality: 'MP Nagar',
    address: '5 VIP Road', coordinates: { lat: 23.2, lng: 77.4 },
    price: 15000000, priceUnit: 'total', size: 3000, sizeUnit: 'sqft',
    bedrooms: 4, bathrooms: 3, facing: 'north', constructionStatus: 'ready_to_move',
    isFeatured: false, isLuxury: true, isActive: true,
  },
  {
    title: 'Inactive Flat', slug: 'inactive-flat-indore-c3',
    description: 'Hidden', listingType: 'rent', propertyType: 'flat',
    projectCategory: 'ongoing', city: 'indore', locality: 'Palasia',
    address: '1 Old Rd', coordinates: { lat: 22.7, lng: 75.8 },
    price: 15000, priceUnit: 'total', size: 800, sizeUnit: 'sqft',
    bedrooms: 2, bathrooms: 1, facing: 'south', constructionStatus: 'under_construction',
    isActive: false,
  },
];

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(async () => { await PropertyModel.insertMany(sampleProps); });
afterEach(clearCollections);

describe('GET /v1/properties', () => {
  it('returns only active properties', async () => {
    const res = await request(app).get('/v1/properties');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((p: { isActive: boolean }) => p.isActive)).toBe(true);
  });

  it('filters by city', async () => {
    const res = await request(app).get('/v1/properties?city=indore');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { city: string }) => p.city === 'indore')).toBe(true);
  });

  it('filters by listingType', async () => {
    const res = await request(app).get('/v1/properties?listingType=buy');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { listingType: string }) => p.listingType === 'buy')).toBe(true);
  });

  it('includes pagination meta', async () => {
    const res = await request(app).get('/v1/properties?page=1&limit=10');
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 2 });
  });
});

describe('GET /v1/properties/featured', () => {
  it('returns only featured active properties', async () => {
    const res = await request(app).get('/v1/properties/featured');
    expect(res.status).toBe(200);
    expect(res.body.every((p: { isFeatured: boolean }) => p.isFeatured)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /v1/properties/luxury', () => {
  it('returns only luxury active properties', async () => {
    const res = await request(app).get('/v1/properties/luxury');
    expect(res.status).toBe(200);
    expect(res.body.every((p: { isLuxury: boolean }) => p.isLuxury)).toBe(true);
  });
});

describe('GET /v1/properties/:slug', () => {
  it('returns a property by slug', async () => {
    const res = await request(app).get('/v1/properties/3bhk-flat-vijay-nagar-indore-a1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('3BHK Flat Vijay Nagar');
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/v1/properties/no-such-slug');
    expect(res.status).toBe(404);
  });

  it('returns 404 for inactive property', async () => {
    const res = await request(app).get('/v1/properties/inactive-flat-indore-c3');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=property.test
```

Expected: FAIL

- [ ] **Step 3: Create slug utility**

`apps/api/src/utils/slug.ts`:
```typescript
import slugify from 'slugify';
import crypto from 'crypto';

interface SlugInput {
  bedrooms?: number;
  propertyType: string;
  locality: string;
  city: string;
}

export function generateSlug(input: SlugInput): string {
  const beds = input.bedrooms && input.bedrooms > 0 ? `${input.bedrooms}bhk-` : '';
  const base = `${beds}${input.propertyType}-${input.locality}-${input.city}`;
  const shortId = crypto.randomBytes(3).toString('hex'); // 6 char hex
  return slugify(base, { lower: true, strict: true }) + '-' + shortId;
}
```

`apps/api/src/utils/paginate.ts`:
```typescript
import { ParsedQs } from 'qs';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: ParsedQs): PaginationOptions {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit ?? '12'), 10)));
  return { page, limit, skip: (page - 1) * limit };
}
```

- [ ] **Step 4: Create property service**

`apps/api/src/services/property.service.ts`:
```typescript
import { PropertyModel, PropertyDoc } from '../models/Property';
import { PropertyFilters } from '@indiatownship/types';
import { parsePagination } from '../utils/paginate';
import { ParsedQs } from 'qs';

export async function listProperties(query: ParsedQs) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isActive: true };

  if (query.city) filter.city = query.city;
  if (query.listingType) filter.listingType = query.listingType;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.projectCategory) filter.projectCategory = query.projectCategory;
  if (query.bedrooms) filter.bedrooms = parseInt(String(query.bedrooms), 10);
  if (query.facing) filter.facing = query.facing;
  if (query.constructionStatus) filter.constructionStatus = query.constructionStatus;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) (filter.price as Record<string, number>).$gte = Number(query.minPrice);
    if (query.maxPrice) (filter.price as Record<string, number>).$lte = Number(query.maxPrice);
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    area_asc: { size: 1 },
    area_desc: { size: -1 },
  };
  const sort = sortMap[String(query.sort ?? 'newest')] ?? sortMap.newest;

  const [data, total] = await Promise.all([
    PropertyModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    PropertyModel.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDoc | null> {
  return PropertyModel.findOne({ slug, isActive: true }).lean() as Promise<PropertyDoc | null>;
}

export async function getFeaturedProperties(): Promise<PropertyDoc[]> {
  return PropertyModel.find({ isFeatured: true, isActive: true }).limit(10).lean() as Promise<PropertyDoc[]>;
}

export async function getLuxuryProperties(): Promise<PropertyDoc[]> {
  return PropertyModel.find({ isLuxury: true, isActive: true }).limit(10).lean() as Promise<PropertyDoc[]>;
}

export async function createProperty(data: Partial<PropertyDoc>): Promise<PropertyDoc> {
  return PropertyModel.create(data);
}

export async function updateProperty(id: string, data: Partial<PropertyDoc>): Promise<PropertyDoc | null> {
  return PropertyModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteProperty(id: string): Promise<void> {
  await PropertyModel.findByIdAndDelete(id);
}

export async function togglePropertyActive(id: string): Promise<PropertyDoc | null> {
  const prop = await PropertyModel.findById(id);
  if (!prop) return null;
  prop.isActive = !prop.isActive;
  return prop.save();
}
```

- [ ] **Step 5: Create property controller**

`apps/api/src/controllers/property.controller.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import {
  listProperties, getPropertyBySlug,
  getFeaturedProperties, getLuxuryProperties,
} from '../services/property.service';
import { createError } from '../middleware/errorHandler';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listProperties(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const prop = await getPropertyBySlug(req.params.slug);
    if (!prop) return next(createError('Property not found', 404));
    res.json(prop);
  } catch (err) { next(err); }
}

export async function featured(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getFeaturedProperties());
  } catch (err) { next(err); }
}

export async function luxury(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getLuxuryProperties());
  } catch (err) { next(err); }
}
```

- [ ] **Step 6: Create property router**

`apps/api/src/routes/property.routes.ts`:
```typescript
import { Router } from 'express';
import { list, getBySlug, featured, luxury } from '../controllers/property.controller';

export const propertyRouter = Router();

propertyRouter.get('/featured', featured);
propertyRouter.get('/luxury', luxury);
propertyRouter.get('/', list);
propertyRouter.get('/:slug', getBySlug);
```

- [ ] **Step 7: Run — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=property.test
```

Expected: PASS (8 tests)

- [ ] **Step 8: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/utils apps/api/src/services/property.service.ts apps/api/src/controllers/property.controller.ts apps/api/src/routes/property.routes.ts apps/api/tests/property.test.ts
git commit -m "feat: property service + public routes (list, detail, featured, luxury)"
```

---

## Task 10: WhatsApp Service + Lead Service + Lead Routes

**Files:**
- Create: `apps/api/src/services/whatsapp.service.ts`
- Create: `apps/api/src/services/lead.service.ts`
- Create: `apps/api/src/controllers/lead.controller.ts`
- Create: `apps/api/src/routes/lead.routes.ts`
- Test: `apps/api/tests/lead.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/api/tests/lead.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../src/app';
import { leadRouter } from '../src/routes/lead.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { PropertyModel } from '../src/models/Property';
import { LeadModel } from '../src/models/Lead';

// Mock WhatsApp so tests don't make real HTTP calls
jest.mock('../src/services/whatsapp.service', () => ({
  sendLeadNotification: jest.fn().mockResolvedValue(true),
}));

const app = createApp();
app.use('/v1/leads', leadRouter);
app.use(errorHandler);

let propertyId: string;

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(async () => {
  const p = await PropertyModel.create({
    title: 'Test Property', slug: 'test-prop-indore-z9', description: 'd',
    listingType: 'buy', propertyType: 'flat', projectCategory: 'ready_to_move',
    city: 'indore', locality: 'Vijay Nagar', address: 'addr',
    coordinates: { lat: 22.7, lng: 75.8 }, price: 5000000, priceUnit: 'total',
    size: 1200, sizeUnit: 'sqft', bedrooms: 3, bathrooms: 2,
    facing: 'east', constructionStatus: 'ready_to_move',
  });
  propertyId = String(p._id);
});
afterEach(clearCollections);

describe('POST /v1/leads', () => {
  it('creates a lead and returns 201', async () => {
    const res = await request(app).post('/v1/leads').send({
      propertyId,
      name: 'Rahul Gupta',
      phone: '9876543210',
      email: 'rahul@example.com',
      message: 'I am interested',
      source: 'web',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('new');
    expect(res.body.name).toBe('Rahul Gupta');
  });

  it('creates a lead without property (contact page)', async () => {
    const res = await request(app).post('/v1/leads').send({
      name: 'Anita', phone: '9123456789', source: 'contact_page',
    });
    expect(res.status).toBe(201);
  });

  it('rejects lead without name', async () => {
    const res = await request(app).post('/v1/leads').send({
      phone: '9876543210', source: 'web',
    });
    expect(res.status).toBe(400);
  });

  it('rejects lead without phone', async () => {
    const res = await request(app).post('/v1/leads').send({
      name: 'No Phone', source: 'web',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /v1/leads (brochure gate)', () => {
  it('creates a brochure_gate lead and returns pdf url', async () => {
    // First give the property a brochureUrl
    await PropertyModel.findByIdAndUpdate(propertyId, {
      brochureUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
    });
    const res = await request(app).post('/v1/leads').send({
      propertyId,
      name: 'Brochure User',
      phone: '9000000099',
      source: 'brochure_gate',
    });
    expect(res.status).toBe(201);
    expect(res.body.brochureUrl).toBeDefined();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=lead.test
```

Expected: FAIL

- [ ] **Step 3: Create WhatsApp service**

`apps/api/src/services/whatsapp.service.ts`:
```typescript
import { env } from '../config/env';

interface LeadNotificationData {
  propertyTitle: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export async function sendLeadNotification(data: LeadNotificationData): Promise<boolean> {
  const { phoneNumberId, accessToken, adminNumber } = env.whatsapp;

  if (!phoneNumberId || !accessToken || !adminNumber) {
    console.warn('WhatsApp not configured — skipping notification');
    return false;
  }

  const body = [
    `🏠 *New Inquiry — IndiaTownship*`,
    `Property: ${data.propertyTitle || 'General Inquiry'}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || 'N/A'}`,
    `Message: ${data.message || 'N/A'}`,
  ].join('\n');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: adminNumber,
          type: 'text',
          text: { body },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('WhatsApp API error:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('WhatsApp send failed:', err);
    return false;
  }
}
```

- [ ] **Step 4: Create lead service**

`apps/api/src/services/lead.service.ts`:
```typescript
import { LeadModel, LeadDoc } from '../models/Lead';
import { PropertyModel } from '../models/Property';
import { sendLeadNotification } from './whatsapp.service';

interface CreateLeadInput {
  propertyId?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: LeadDoc['source'];
}

export async function createLead(input: CreateLeadInput): Promise<LeadDoc & { brochureUrl?: string }> {
  const leadData: Partial<LeadDoc> & { property?: LeadDoc['property'] } = {
    name: input.name,
    phone: input.phone,
    email: input.email ?? '',
    message: input.message ?? '',
    source: input.source ?? 'web',
    status: 'new',
  };

  let propertyTitle = 'General Inquiry';
  let brochureUrl: string | undefined;

  if (input.propertyId) {
    const prop = await PropertyModel.findById(input.propertyId);
    if (prop) {
      leadData.property = prop._id;
      propertyTitle = prop.title;
      if (input.source === 'brochure_gate' && prop.brochureUrl) {
        brochureUrl = prop.brochureUrl;
      }
    }
  }

  const lead = await LeadModel.create(leadData);

  // Fire-and-forget WhatsApp notification; failure does not abort lead creation
  sendLeadNotification({
    propertyTitle,
    name: input.name,
    phone: input.phone,
    email: input.email ?? '',
    message: input.message ?? '',
  })
    .then((sent) => {
      if (sent) {
        LeadModel.findByIdAndUpdate(lead._id, {
          whatsappSent: true,
          whatsappSentAt: new Date(),
        }).exec();
      }
    })
    .catch(() => { /* WhatsApp failure is non-fatal */ });

  return Object.assign(lead.toObject(), brochureUrl ? { brochureUrl } : {});
}
```

- [ ] **Step 5: Create lead controller and router**

`apps/api/src/controllers/lead.controller.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { createLead } from '../services/lead.service';
import { createError } from '../middleware/errorHandler';

export async function submitLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId, name, phone, email, message, source } = req.body;
    if (!name) return next(createError('name is required', 400));
    if (!phone) return next(createError('phone is required', 400));

    const lead = await createLead({ propertyId, name, phone, email, message, source });
    res.status(201).json(lead);
  } catch (err) { next(err); }
}
```

`apps/api/src/routes/lead.routes.ts`:
```typescript
import { Router } from 'express';
import { submitLead } from '../controllers/lead.controller';

export const leadRouter = Router();

leadRouter.post('/', submitLead);
```

- [ ] **Step 6: Run — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=lead.test
```

Expected: PASS (5 tests)

- [ ] **Step 7: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/services/whatsapp.service.ts apps/api/src/services/lead.service.ts apps/api/src/controllers/lead.controller.ts apps/api/src/routes/lead.routes.ts apps/api/tests/lead.test.ts
git commit -m "feat: lead service + WhatsApp notification + lead routes"
```

---

## Task 11: User Routes (profile, saved properties, alerts)

**Files:**
- Create: `apps/api/src/controllers/user.controller.ts`
- Create: `apps/api/src/routes/user.routes.ts`
- Test: `apps/api/tests/user.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/api/tests/user.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../src/app';
import { authRouter } from '../src/routes/auth.routes';
import { userRouter } from '../src/routes/user.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { PropertyModel } from '../src/models/Property';

const app = createApp();
app.use('/v1/auth', authRouter);
app.use('/v1/users', userRouter);
app.use(errorHandler);

async function registerAndLogin() {
  const reg = await request(app).post('/v1/auth/register').send({
    name: 'Test User', phone: '9800000001', password: 'pass1234',
  });
  return reg.body.accessToken as string;
}

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
afterEach(clearCollections);

describe('GET /v1/users/me', () => {
  it('returns profile for authenticated user', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe('9800000001');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/v1/users/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/users/me/saved/:propertyId', () => {
  it('saves a property to user favourites', async () => {
    const token = await registerAndLogin();
    const prop = await PropertyModel.create({
      title: 'Fav Flat', slug: 'fav-flat-indore-f1', description: 'd',
      listingType: 'buy', propertyType: 'flat', projectCategory: 'ready_to_move',
      city: 'indore', locality: 'L', address: 'A', coordinates: { lat: 0, lng: 0 },
      price: 1, priceUnit: 'total', size: 1, sizeUnit: 'sqft',
      bedrooms: 1, bathrooms: 1, facing: 'east', constructionStatus: 'ready_to_move',
    });

    const res = await request(app)
      .post(`/v1/users/me/saved/${prop._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.savedProperties).toContain(String(prop._id));
  });
});

describe('POST /v1/users/me/alerts', () => {
  it('adds an alert to user profile', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/v1/users/me/alerts')
      .set('Authorization', `Bearer ${token}`)
      .send({ city: 'indore', listingType: 'buy', propertyType: 'flat', minPrice: 0, maxPrice: 10000000 });
    expect(res.status).toBe(200);
    expect(res.body.alerts.length).toBe(1);
    expect(res.body.alerts[0].city).toBe('indore');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=user.test
```

Expected: FAIL

- [ ] **Step 3: Implement user controller**

`apps/api/src/controllers/user.controller.ts`:
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

function sanitize(user: InstanceType<typeof UserModel>) {
  const obj = user.toObject() as Record<string, unknown>;
  delete obj.passwordHash;
  return obj;
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId, { name }, { new: true, runValidators: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function saveProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const propId = new mongoose.Types.ObjectId(req.params.propertyId);
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $addToSet: { savedProperties: propId } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function unsaveProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const propId = new mongoose.Types.ObjectId(req.params.propertyId);
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $pull: { savedProperties: propId } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function getSaved(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findById(req.user!.userId).populate('savedProperties');
    if (!user) return next(createError('User not found', 404));
    res.json(user.savedProperties);
  } catch (err) { next(err); }
}

export async function addAlert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { city, listingType, propertyType, minPrice, maxPrice } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $push: { alerts: { city, listingType, propertyType, minPrice, maxPrice } } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function deleteAlert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $pull: { alerts: { _id: req.params.alertId } } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}
```

`apps/api/src/routes/user.routes.ts`:
```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMe, updateMe, saveProperty, unsaveProperty, getSaved, addAlert, deleteAlert } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get('/me', getMe);
userRouter.patch('/me', updateMe);
userRouter.get('/me/saved', getSaved);
userRouter.post('/me/saved/:propertyId', saveProperty);
userRouter.delete('/me/saved/:propertyId', unsaveProperty);
userRouter.post('/me/alerts', addAlert);
userRouter.delete('/me/alerts/:alertId', deleteAlert);
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=user.test
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/controllers/user.controller.ts apps/api/src/routes/user.routes.ts apps/api/tests/user.test.ts
git commit -m "feat: user routes (profile, saved properties, alerts)"
```

---

## Task 12: Cloudinary Service + Admin Routes

**Files:**
- Create: `apps/api/src/services/cloudinary.service.ts`
- Create: `apps/api/src/controllers/admin.controller.ts`
- Create: `apps/api/src/routes/admin.routes.ts`
- Test: `apps/api/tests/admin.test.ts`

- [ ] **Step 1: Write failing tests**

`apps/api/tests/admin.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../src/app';
import { authRouter } from '../src/routes/auth.routes';
import { adminRouter } from '../src/routes/admin.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { UserModel } from '../src/models/User';
import { hashPassword } from '../src/services/auth.service';
import { PropertyModel } from '../src/models/Property';
import { LeadModel } from '../src/models/Lead';

const app = createApp();
app.use('/v1/auth', authRouter);
app.use('/v1/admin', adminRouter);
app.use(errorHandler);

async function getAdminToken(): Promise<string> {
  const hash = await hashPassword('adminpass');
  await UserModel.create({ name: 'Admin', phone: '9000000000', email: 'admin@it.com', passwordHash: hash, role: 'admin' });
  const res = await request(app).post('/v1/auth/login').send({ phone: '9000000000', password: 'adminpass' });
  return res.body.accessToken;
}

async function getUserToken(): Promise<string> {
  const res = await request(app).post('/v1/auth/register').send({ name: 'User', phone: '9111222333', password: 'userpass' });
  return res.body.accessToken;
}

const samplePropData = {
  title: 'Admin Created Flat', slug: 'admin-created-flat-indore-x7',
  description: 'Created by admin', listingType: 'buy', propertyType: 'flat',
  projectCategory: 'ready_to_move', city: 'indore', locality: 'Scheme 54',
  address: '5 AB Road', coordinates: { lat: 22.7, lng: 75.8 },
  price: 4500000, priceUnit: 'total', size: 1100, sizeUnit: 'sqft',
  bedrooms: 2, bathrooms: 2, facing: 'north', constructionStatus: 'ready_to_move',
};

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
afterEach(clearCollections);

describe('Admin auth guard', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/v1/admin/leads');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const token = await getUserToken();
    const res = await request(app).get('/v1/admin/leads').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /v1/admin/properties', () => {
  it('admin creates a property', async () => {
    const token = await getAdminToken();
    const res = await request(app)
      .post('/v1/admin/properties')
      .set('Authorization', `Bearer ${token}`)
      .send(samplePropData);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Admin Created Flat');
  });
});

describe('PATCH /v1/admin/properties/:id/toggle', () => {
  it('toggles isActive on a property', async () => {
    const token = await getAdminToken();
    const prop = await PropertyModel.create(samplePropData);
    const res = await request(app)
      .patch(`/v1/admin/properties/${prop._id}/toggle`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });
});

describe('GET /v1/admin/leads', () => {
  it('returns all leads for admin', async () => {
    const token = await getAdminToken();
    const prop = await PropertyModel.create(samplePropData);
    await LeadModel.create({ property: prop._id, name: 'L1', phone: '1', source: 'web' });
    await LeadModel.create({ property: prop._id, name: 'L2', phone: '2', source: 'mobile' });
    const res = await request(app).get('/v1/admin/leads').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('filters leads by status', async () => {
    const token = await getAdminToken();
    const prop = await PropertyModel.create(samplePropData);
    await LeadModel.create({ property: prop._id, name: 'L1', phone: '1', source: 'web', status: 'new' });
    await LeadModel.create({ property: prop._id, name: 'L2', phone: '2', source: 'web', status: 'contacted' });
    const res = await request(app).get('/v1/admin/leads?status=new').set('Authorization', `Bearer ${token}`);
    expect(res.body.data.every((l: { status: string }) => l.status === 'new')).toBe(true);
  });
});

describe('PATCH /v1/admin/leads/:id', () => {
  it('updates lead status and notes', async () => {
    const token = await getAdminToken();
    const prop = await PropertyModel.create(samplePropData);
    const lead = await LeadModel.create({ property: prop._id, name: 'L', phone: '9', source: 'web' });
    const res = await request(app)
      .patch(`/v1/admin/leads/${lead._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'contacted', adminNotes: 'Called, interested.' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('contacted');
    expect(res.body.adminNotes).toBe('Called, interested.');
  });
});

describe('GET /v1/admin/analytics', () => {
  it('returns dashboard stats', async () => {
    const token = await getAdminToken();
    const res = await request(app).get('/v1/admin/analytics').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalProperties');
    expect(res.body).toHaveProperty('totalLeads');
    expect(res.body).toHaveProperty('newLeads');
    expect(res.body).toHaveProperty('totalUsers');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd apps/api && npm test -- --testPathPattern=admin.test
```

Expected: FAIL

- [ ] **Step 3: Create Cloudinary service**

`apps/api/src/services/cloudinary.service.ts`:
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export async function uploadImage(
  fileBase64: string,
  folder = 'indiatownship/properties'
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadPdf(
  fileBase64: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder: 'indiatownship/brochures',
    resource_type: 'raw',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

- [ ] **Step 4: Create admin controller**

`apps/api/src/controllers/admin.controller.ts`:
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PropertyModel } from '../models/Property';
import { LeadModel } from '../models/Lead';
import { UserModel } from '../models/User';
import {
  createProperty, updateProperty, deleteProperty, togglePropertyActive,
} from '../services/property.service';
import { createError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/slug';
import { parsePagination } from '../utils/paginate';

// --- Properties ---

export async function adminCreateProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = req.body;
    if (!data.slug) {
      data.slug = generateSlug({
        bedrooms: data.bedrooms,
        propertyType: data.propertyType,
        locality: data.locality,
        city: data.city,
      });
    }
    const prop = await createProperty(data);
    res.status(201).json(prop);
  } catch (err) { next(err); }
}

export async function adminUpdateProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prop = await updateProperty(req.params.id, req.body);
    if (!prop) return next(createError('Property not found', 404));
    res.json(prop);
  } catch (err) { next(err); }
}

export async function adminDeleteProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteProperty(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function adminToggleProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prop = await togglePropertyActive(req.params.id);
    if (!prop) return next(createError('Property not found', 404));
    res.json(prop);
  } catch (err) { next(err); }
}

export async function adminListProperties(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.city) filter.city = req.query.city;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const [data, total] = await Promise.all([
      PropertyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PropertyModel.countDocuments(filter),
    ]);
    res.json({ data, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}

// --- Leads ---

export async function adminListLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) {
      // Filter leads by property city via lookup
      const props = await PropertyModel.find({ city: req.query.city }).select('_id');
      filter.property = { $in: props.map((p) => p._id) };
    }
    const [data, total] = await Promise.all([
      LeadModel.find(filter).populate('property', 'title city slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LeadModel.countDocuments(filter),
    ]);
    res.json({ data, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}

export async function adminUpdateLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, adminNotes } = req.body;
    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!lead) return next(createError('Lead not found', 404));
    res.json(lead);
  } catch (err) { next(err); }
}

// --- Users ---

export async function adminListUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      UserModel.find({}, '-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(),
    ]);
    res.json({ data, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}

export async function adminUpdateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { isActive } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.params.id, { isActive }, { new: true, projection: '-passwordHash' }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(user);
  } catch (err) { next(err); }
}

// --- Analytics ---

export async function adminAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [totalProperties, totalLeads, newLeads, totalUsers] = await Promise.all([
      PropertyModel.countDocuments(),
      LeadModel.countDocuments(),
      LeadModel.countDocuments({ status: 'new' }),
      UserModel.countDocuments({ role: 'user' }),
    ]);
    res.json({ totalProperties, totalLeads, newLeads, totalUsers });
  } catch (err) { next(err); }
}
```

- [ ] **Step 5: Create admin router**

`apps/api/src/routes/admin.routes.ts`:
```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminOnly';
import {
  adminCreateProperty, adminUpdateProperty, adminDeleteProperty,
  adminToggleProperty, adminListProperties,
  adminListLeads, adminUpdateLead,
  adminListUsers, adminUpdateUser,
  adminAnalytics,
} from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

// Properties
adminRouter.get('/properties', adminListProperties);
adminRouter.post('/properties', adminCreateProperty);
adminRouter.patch('/properties/:id', adminUpdateProperty);
adminRouter.delete('/properties/:id', adminDeleteProperty);
adminRouter.patch('/properties/:id/toggle', adminToggleProperty);

// Leads
adminRouter.get('/leads', adminListLeads);
adminRouter.patch('/leads/:id', adminUpdateLead);

// Users
adminRouter.get('/users', adminListUsers);
adminRouter.patch('/users/:id', adminUpdateUser);

// Analytics
adminRouter.get('/analytics', adminAnalytics);
```

- [ ] **Step 6: Run — expect PASS**

```bash
cd apps/api && npm test -- --testPathPattern=admin.test
```

Expected: PASS (9 tests)

- [ ] **Step 7: Commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/services/cloudinary.service.ts apps/api/src/controllers/admin.controller.ts apps/api/src/routes/admin.routes.ts apps/api/tests/admin.test.ts
git commit -m "feat: admin routes (properties, leads, users, analytics)"
```

---

## Task 13: Wire Routes + Full Test Suite

**Files:**
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Update app.ts with all routes wired**

`apps/api/src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { propertyRouter } from './routes/property.routes';
import { leadRouter } from './routes/lead.routes';
import { userRouter } from './routes/user.routes';
import { adminRouter } from './routes/admin.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'silent' : 'dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/v1/auth', authRouter);
  app.use('/v1/properties', propertyRouter);
  app.use('/v1/leads', leadRouter);
  app.use('/v1/users', userRouter);
  app.use('/v1/admin', adminRouter);

  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 2: Update index.ts to use createApp directly**

`apps/api/src/index.ts`:
```typescript
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`🚀 API running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Run full test suite**

```bash
cd apps/api && npm test
```

Expected output:
```
PASS tests/db.test.ts
PASS tests/models.test.ts
PASS tests/auth.service.test.ts
PASS tests/auth.test.ts
PASS tests/property.test.ts
PASS tests/lead.test.ts
PASS tests/user.test.ts
PASS tests/admin.test.ts

Test Suites: 8 passed, 8 total
Tests:       ~45 passed, ~45 total
```

- [ ] **Step 4: Verify TypeScript compiles clean**

```bash
cd apps/api && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Copy .env.example to .env and start the server (smoke test)**

```bash
cd apps/api
cp .env.example .env
# Edit .env: set MONGODB_URI to your Atlas URI or a local MongoDB
# Set JWT_SECRET and JWT_REFRESH_SECRET to random strings (min 32 chars)
# Leave Cloudinary + WhatsApp blank for now — they degrade gracefully
npm run dev
```

Expected: `🚀 API running on http://localhost:3001` + `MongoDB connected`

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 6: Final commit**

```bash
cd /Users/vinayak/indiatownship
git add apps/api/src/app.ts apps/api/src/index.ts
git commit -m "feat: wire all routes, API complete and all tests passing"
```

---

## Self-Review Against Spec

| Spec Requirement | Covered in Plan | Task |
|---|---|---|
| Express.js API | ✅ | Task 3 |
| MongoDB + Mongoose | ✅ | Tasks 4–5 |
| JWT auth (phone+pw / email+pw) | ✅ | Tasks 6–8 |
| Property model (all fields) | ✅ | Task 5 |
| User model (alerts, saved) | ✅ | Task 5 |
| Lead model (status, whatsapp) | ✅ | Task 5 |
| Public property routes (list, filter, detail, featured, luxury) | ✅ | Task 9 |
| Lead submission (web + mobile + brochure gate) | ✅ | Task 10 |
| WhatsApp Business API notification | ✅ | Task 10 |
| User profile, saved properties, alerts | ✅ | Task 11 |
| Admin: property CRUD + toggle | ✅ | Task 12 |
| Admin: lead management (list, filter, update status/notes) | ✅ | Task 12 |
| Admin: user list + activate/deactivate | ✅ | Task 12 |
| Admin: dashboard analytics | ✅ | Task 12 |
| Slug generation | ✅ | Task 9 |
| Pagination helper | ✅ | Task 9 |
| Cloudinary service | ✅ | Task 12 |
| Turborepo monorepo | ✅ | Task 1 |
| Shared types package | ✅ | Task 2 |
| Error handling middleware | ✅ | Task 7 |
| Auth middleware (requireAuth, requireAdmin) | ✅ | Task 7 |

All spec requirements covered. No gaps.
