import request from 'supertest';
import { createApp } from '../src/app';
import { authRouter } from '../src/routes/auth.routes';
import { userRouter } from '../src/routes/user.routes';
import { errorHandler } from '../src/middleware/errorHandler';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { PropertyModel } from '../src/models/Property';

// Set JWT secrets
process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!!';

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
