import type { Metadata } from 'next';

const SITE_NAME = 'IndiaTownship';
const SITE_URL = 'https://indiatownship.com';

export function listingMetadata({
  city,
  listingType,
}: {
  city: string;
  listingType: 'buy' | 'rent';
}): Metadata {
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
  const action = listingType === 'buy' ? 'Buy' : 'Rent';
  const title = `${action} Property in ${cityLabel}`;
  const description = `Find properties for ${listingType === 'buy' ? 'sale' : 'rent'} in ${cityLabel}. Verified listings, best prices on ${SITE_NAME}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: 'website',
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${SITE_URL}/${listingType}/${city}`,
    },
  };
}

export function propertyMetadata({
  title,
  description,
  imageUrl,
  slug,
}: {
  title: string;
  description?: string;
  imageUrl?: string;
  slug: string;
}): Metadata {
  return {
    title,
    description: description?.slice(0, 160),
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: description?.slice(0, 160),
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      type: 'website',
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${SITE_URL}/property/${slug}`,
    },
  };
}
