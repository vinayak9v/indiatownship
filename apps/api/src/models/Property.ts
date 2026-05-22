import mongoose, { Schema, Document } from 'mongoose';
import type {
  ListingType, PropertyType, ProjectCategory, City,
  Facing, ConstructionStatus, PropertyImage, PriceUnit, SizeUnit,
} from '@indiatownship/types';

export interface PropertyDoc extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<PropertyDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    listingType: { type: String, enum: ['buy', 'rent'], required: true },
    propertyType: { type: String, enum: ['flat', 'villa', 'house', 'plot'], required: true },
    projectCategory: { type: String, enum: ['new_launch', 'ongoing', 'ready_to_move'], required: true },
    city: { type: String, enum: ['indore', 'bhopal'], required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['total', 'per_sqft'], default: 'total' },
    size: { type: Number, required: true },
    sizeUnit: { type: String, enum: ['sqft', 'sqyard', 'acre'], default: 'sqft' },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    facing: {
      type: String,
      enum: ['north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west'],
    },
    constructionStatus: {
      type: String,
      enum: ['under_construction', 'ready_to_move', 'new_launch'],
      required: true,
    },
    images: [
      {
        url: String,
        type: { type: String, enum: ['outdoor', 'indoor', 'floor_plan', 'master_plan'] },
        caption: { type: String, default: '' },
      },
    ],
    brochureUrl: { type: String, default: '' },
    amenities: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isLuxury: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

PropertySchema.index({ city: 1, listingType: 1, propertyType: 1 });
PropertySchema.index({ isFeatured: 1, isActive: 1 });

export const PropertyModel = mongoose.model<PropertyDoc>('Property', PropertySchema);
