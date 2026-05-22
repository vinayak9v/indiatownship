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
