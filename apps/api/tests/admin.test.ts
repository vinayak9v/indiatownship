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

process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!!';

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
