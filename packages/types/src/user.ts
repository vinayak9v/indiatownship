import { City, ListingType, PropertyType } from './property';

export interface UserAlert {
  _id?: string;
  city: City | 'all';
  listingType: ListingType | 'any';
  propertyType: PropertyType | 'any';
  minPrice: number;
  maxPrice: number;
}

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: 'user' | 'admin';
  savedProperties: string[];
  alerts: UserAlert[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
