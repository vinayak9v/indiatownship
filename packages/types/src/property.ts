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
