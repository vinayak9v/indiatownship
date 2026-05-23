import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { PropertyType, ConstructionStatus } from '@indiatownship/types';
import { FilterSidebar } from '@/components/property/FilterSidebar';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { getProperties } from '@/lib/api';

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'area_desc';

const VALID_CITIES = ['indore', 'bhopal'] as const;
type ValidCity = (typeof VALID_CITIES)[number];

interface PageProps {
  params: { city: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = params.city as ValidCity;
  if (!VALID_CITIES.includes(city)) return {};
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `Buy Property in ${cityLabel}`,
    description: `Find flats, villas, houses and plots for sale in ${cityLabel}. Verified listings with best prices.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function BuyPage({ params, searchParams }: PageProps) {
  const city = params.city as ValidCity;
  if (!VALID_CITIES.includes(city)) notFound();

  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
  const page = Number(searchParams.page ?? '1');
  const sp = searchParams;

  const { properties, total, totalPages } = await getProperties({
    city,
    listingType: 'buy',
    propertyType: (sp.propertyType as PropertyType) || undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
    constructionStatus: (sp.constructionStatus as ConstructionStatus) || undefined,
    sort: (sp.sort as SortOption) || undefined,
    page,
    limit: 12,
  }).catch(() => ({ properties: [], total: 0, page: 1, totalPages: 0 }));

  return (
    <div className="container-site py-8">
      <h1 className="font-display text-3xl font-bold text-navy mb-2">
        Buy Property in {cityLabel}
      </h1>
      <p className="text-gray-500 mb-8">
        Verified flats, villas, houses &amp; plots for sale in {cityLabel}
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 shrink-0">
          <FilterSidebar />
        </div>
        <div className="flex-1 min-w-0">
          <PropertyGrid
            properties={properties}
            total={total}
            page={page}
            totalPages={totalPages}
            basePath={`/buy/${city}`}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
