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
