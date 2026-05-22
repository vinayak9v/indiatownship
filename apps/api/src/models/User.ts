import mongoose, { Schema, Document } from 'mongoose';

export interface AlertDoc {
  _id: mongoose.Types.ObjectId;
  city: 'indore' | 'bhopal' | 'all';
  listingType: 'buy' | 'rent' | 'any';
  propertyType: string;
  minPrice: number;
  maxPrice: number;
}

export interface UserDoc extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  savedProperties: mongoose.Types.ObjectId[];
  alerts: AlertDoc[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<AlertDoc>({
  city: { type: String, enum: ['indore', 'bhopal', 'all'], default: 'all' },
  listingType: { type: String, enum: ['buy', 'rent', 'any'], default: 'any' },
  propertyType: { type: String, default: 'any' },
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: 999999999 },
});

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    alerts: [AlertSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDoc>('User', UserSchema);
