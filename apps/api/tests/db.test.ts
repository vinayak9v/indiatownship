import { connectTestDb, disconnectTestDb } from './helpers/db';
import mongoose from 'mongoose';

describe('DB helper', () => {
  beforeAll(connectTestDb);
  afterAll(disconnectTestDb);

  it('connects to in-memory MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
