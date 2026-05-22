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
