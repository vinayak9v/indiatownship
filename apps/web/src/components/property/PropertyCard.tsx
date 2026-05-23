import Image from 'next/image';
import Link from 'next/link';
import type { IProperty } from '@indiatownship/types';

interface PropertyCardProps {
  property: IProperty;
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.images?.[0]?.url ?? '/placeholder-property.jpg';
  const priceLabel = formatPrice(property.price);
  const bedroomLabel =
    property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BHK`;

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-navy text-white text-xs font-semibold px-2 py-1 rounded">
            {property.listingType === 'buy' ? 'For Sale' : 'For Rent'}
          </span>
          {property.isFeatured && (
            <span className="bg-gold text-navy text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xl font-bold text-navy">{priceLabel}</p>
        <h3 className="font-display text-base font-semibold text-gray-900 mt-1 line-clamp-2">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {property.locality}, {property.city.charAt(0).toUpperCase() + property.city.slice(1)}
        </p>

        {/* Details row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
          {property.propertyType !== 'plot' && (
            <span>{bedroomLabel}</span>
          )}
          <span>
            {property.size} {property.sizeUnit}
          </span>
          <span className="capitalize">{property.constructionStatus.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </Link>
  );
}
