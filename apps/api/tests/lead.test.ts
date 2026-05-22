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
