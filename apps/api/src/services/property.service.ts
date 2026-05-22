import { PropertyModel, PropertyDoc } from '../models/Property';
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
  return PropertyModel.findOne({ slug, isActive: true }).lean() as unknown as Promise<PropertyDoc | null>;
}

export async function getFeaturedProperties(): Promise<PropertyDoc[]> {
  return PropertyModel.find({ isFeatured: true, isActive: true }).limit(10).lean() as unknown as Promise<PropertyDoc[]>;
}

export async function getLuxuryProperties(): Promise<PropertyDoc[]> {
  return PropertyModel.find({ isLuxury: true, isActive: true }).limit(10).lean() as unknown as Promise<PropertyDoc[]>;
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
