import request from 'supertest';
import { createApp } from '../src/app';
import { authRouter } from '../src/routes/auth.routes';
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db';
import { errorHandler } from '../src/middleware/errorHandler';

// Set JWT secrets for tests
process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!!';

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
