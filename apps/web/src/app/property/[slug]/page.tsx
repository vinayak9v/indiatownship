import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { InquiryForm } from '@/components/property/InquiryForm';
import { BrochureGate } from '@/components/property/BrochureGate';
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA';
import { GoogleMap } from '@/components/ui/GoogleMap';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getPropertyBySlug, getProperties } from '@/lib/api';
import type { IProperty } from '@indiatownship/types';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 1800; // ISR: 30 minutes

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const property = await getPropertyBySlug(params.slug);
    return {
      title: property.metaTitle || property.title,
      description: property.metaDescription || property.description?.slice(0, 160),
      openGraph: {
        title: property.metaTitle || property.title,
        description: property.metaDescription || property.description?.slice(0, 160),
        images: property.images.length > 0 ? [{ url: property.images[0].url }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: property.metaTitle || property.title,
        description: property.metaDescription || property.description?.slice(0, 160),
        images: property.images.length > 0 ? [property.images[0].url] : [],
      },
    };
  } catch {
    return {};
  }
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  let property: IProperty;
  try {
    property = await getPropertyBySlug(params.slug, { next: { revalidate: 1800 } });
  } catch {
    return notFound();
  }

  // Similar properties
  const { properties: similar } = await getProperties(
    { city: property.city, propertyType: property.propertyType, limit: 4 },
    { next: { revalidate: 1800 } }
  ).catch(() => ({ properties: [], total: 0, page: 1, totalPages: 0 }));

  const similarFiltered = similar.filter((p) => p._id !== property._id);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `https://indiatownship.com/property/${property.slug}`,
    image: property.images[0]?.url,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.locality,
      addressRegion: 'Madhya Pradesh',
      addressCountry: 'IN',
    },
    ...(property.coordinates.lat && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.coordinates.lat,
        longitude: property.coordinates.lng,
      },
    }),
  };

  const priceLabel = formatPrice(property.price);
  const cityLabel = property.city.charAt(0).toUpperCase() + property.city.slice(1);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-site py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Gallery */}
            {property.images.length > 0 && (
              <PropertyGallery images={property.images} title={property.title} />
            )}

            {/* Overview */}
            <div>
              <h1 className="font-display text-3xl font-bold text-navy">{property.title}</h1>
              <p className="text-gray-500 mt-1">{property.locality}, {cityLabel}</p>
              <p className="text-3xl font-bold text-navy mt-3">{priceLabel}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
                {property.bedrooms > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bedrooms</p>
                    <p className="font-semibold text-navy">{property.bedrooms} BHK</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bathrooms</p>
                    <p className="font-semibold text-navy">{property.bathrooms}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Size</p>
                  <p className="font-semibold text-navy">{property.size} {property.sizeUnit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="font-semibold text-navy capitalize">
                    {property.constructionStatus.replace(/_/g, ' ')}
                  </p>
                </div>
                {property.facing && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Facing</p>
                    <p className="font-semibold text-navy capitalize">
                      {property.facing.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy mb-3">About This Property</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-gold">✓</span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.coordinates.lat && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy mb-4">Location</h2>
                <GoogleMap
                  lat={property.coordinates.lat}
                  lng={property.coordinates.lng}
                  title={property.title}
                />
                <p className="text-sm text-gray-500 mt-2">{property.address}</p>
              </div>
            )}

            {/* Similar Properties */}
            {similarFiltered.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarFiltered.slice(0, 2).map((p) => (
                    <PropertyCard key={p._id} property={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="lg:w-80 shrink-0 space-y-4">
            <div className="sticky top-20">
              <InquiryForm propertyId={property._id} propertyTitle={property.title} />
              <div className="mt-3 space-y-3">
                <WhatsAppCTA propertyTitle={property.title} />
                {property.brochureUrl && (
                  <BrochureGate propertyId={property._id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
