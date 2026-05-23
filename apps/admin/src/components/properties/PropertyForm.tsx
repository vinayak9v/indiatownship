'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { IProperty } from '@indiatownship/types';
import { createProperty, updateProperty } from '@/lib/api';

type PropertyFormData = {
  title: string;
  description: string;
  listingType: 'buy' | 'rent';
  propertyType: 'flat' | 'villa' | 'house' | 'plot';
  projectCategory: 'new_launch' | 'ongoing' | 'ready_to_move';
  city: 'indore' | 'bhopal';
  locality: string;
  address: string;
  price: number;
  priceUnit: 'total' | 'per_sqft';
  size: number;
  sizeUnit: 'sqft' | 'sqyard' | 'acre';
  bedrooms: number;
  bathrooms: number;
  constructionStatus: 'under_construction' | 'ready_to_move' | 'new_launch';
  amenities: string;
  metaTitle: string;
  metaDescription: string;
  isFeatured: boolean;
  isLuxury: boolean;
  isActive: boolean;
};

interface PropertyFormProps {
  property?: IProperty;
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!property;

  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: property ? {
      title: property.title,
      description: property.description,
      listingType: property.listingType,
      propertyType: property.propertyType,
      projectCategory: property.projectCategory,
      city: property.city,
      locality: property.locality,
      address: property.address,
      price: property.price,
      priceUnit: property.priceUnit,
      size: property.size,
      sizeUnit: property.sizeUnit,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      constructionStatus: property.constructionStatus,
      amenities: property.amenities?.join(', ') ?? '',
      metaTitle: property.metaTitle ?? '',
      metaDescription: property.metaDescription ?? '',
      isFeatured: property.isFeatured,
      isLuxury: property.isLuxury,
      isActive: property.isActive,
    } : {
      listingType: 'buy',
      propertyType: 'flat',
      projectCategory: 'ready_to_move',
      city: 'indore',
      priceUnit: 'total',
      sizeUnit: 'sqft',
      constructionStatus: 'ready_to_move',
      bedrooms: 2,
      bathrooms: 2,
      isFeatured: false,
      isLuxury: false,
      isActive: true,
    },
  });

  async function onSubmit(data: PropertyFormData) {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        size: Number(data.size),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        amenities: data.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      };

      if (isEdit && property) {
        await updateProperty(String(property._id), payload);
      } else {
        await createProperty(payload);
      }
      router.push('/properties');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div>
          <label className="label">Title *</label>
          <input {...register('title', { required: true })} className="input" placeholder="3 BHK Flat in Vijay Nagar, Indore" />
          {errors.title && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Property description..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Listing Type</label>
            <select {...register('listingType')} className="input">
              <option value="buy">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="label">Property Type</label>
            <select {...register('propertyType')} className="input">
              <option value="flat">Flat</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="plot">Plot</option>
            </select>
          </div>
          <div>
            <label className="label">Project Category</label>
            <select {...register('projectCategory')} className="input">
              <option value="new_launch">New Launch</option>
              <option value="ongoing">Ongoing</option>
              <option value="ready_to_move">Ready to Move</option>
            </select>
          </div>
          <div>
            <label className="label">Construction Status</label>
            <select {...register('constructionStatus')} className="input">
              <option value="new_launch">New Launch</option>
              <option value="under_construction">Under Construction</option>
              <option value="ready_to_move">Ready to Move</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <select {...register('city')} className="input">
              <option value="indore">Indore</option>
              <option value="bhopal">Bhopal</option>
            </select>
          </div>
          <div>
            <label className="label">Locality *</label>
            <input {...register('locality', { required: true })} className="input" placeholder="Vijay Nagar" />
          </div>
        </div>
        <div>
          <label className="label">Full Address</label>
          <input {...register('address')} className="input" placeholder="Plot 12, Scheme 54..." />
        </div>
      </div>

      {/* Pricing + Size */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Pricing & Size</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price *</label>
            <input type="number" {...register('price', { required: true })} className="input" placeholder="5000000" />
          </div>
          <div>
            <label className="label">Price Unit</label>
            <select {...register('priceUnit')} className="input">
              <option value="total">Total</option>
              <option value="per_sqft">Per Sqft</option>
            </select>
          </div>
          <div>
            <label className="label">Size *</label>
            <input type="number" {...register('size', { required: true })} className="input" placeholder="1200" />
          </div>
          <div>
            <label className="label">Size Unit</label>
            <select {...register('sizeUnit')} className="input">
              <option value="sqft">Sq Ft</option>
              <option value="sqyard">Sq Yard</option>
              <option value="acre">Acre</option>
            </select>
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <input type="number" {...register('bedrooms')} className="input" min={0} />
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <input type="number" {...register('bathrooms')} className="input" min={0} />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Amenities</h2>
        <div>
          <label className="label">Amenities (comma-separated)</label>
          <textarea
            {...register('amenities')}
            rows={3}
            className="input resize-none"
            placeholder="Swimming Pool, Gym, 24/7 Security, Club House"
          />
        </div>
      </div>

      {/* SEO */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">SEO</h2>
        <div>
          <label className="label">Meta Title</label>
          <input {...register('metaTitle')} className="input" placeholder="3 BHK Flat for Sale in Vijay Nagar Indore" />
        </div>
        <div>
          <label className="label">Meta Description</label>
          <textarea {...register('metaDescription')} rows={2} className="input resize-none" placeholder="Max 160 chars" />
        </div>
      </div>

      {/* Flags */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Flags</h2>
        <div className="flex flex-wrap gap-6">
          {([
            { name: 'isFeatured', label: 'Featured Project' },
            { name: 'isLuxury', label: 'Luxury Property' },
            { name: 'isActive', label: 'Active (Visible)' },
          ] as const).map((f) => (
            <label key={f.name} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register(f.name)} className="accent-navy w-4 h-4" />
              <span className="text-sm text-gray-700">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Property'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
