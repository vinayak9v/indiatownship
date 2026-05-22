import mongoose, { Schema, Document } from 'mongoose';
import type { LeadStatus, LeadSource } from '@indiatownship/types';

export interface LeadDoc extends Document {
  property: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  adminNotes: string;
  whatsappSent: boolean;
  whatsappSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<LeadDoc>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    message: { type: String, default: '' },
    source: {
      type: String,
      enum: ['web', 'mobile', 'contact_page', 'brochure_gate'],
      default: 'web',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed', 'not_interested'],
      default: 'new',
    },
    adminNotes: { type: String, default: '' },
    whatsappSent: { type: Boolean, default: false },
    whatsappSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ property: 1 });

export const LeadModel = mongoose.model<LeadDoc>('Lead', LeadSchema);
