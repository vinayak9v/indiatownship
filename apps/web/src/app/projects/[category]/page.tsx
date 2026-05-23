import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilterSidebar } from '@/components/property/FilterSidebar';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { getProperties } from '@/lib/api';

type ProjectCategorySlug = 'new-launch' | 'ongoing' | 'ready-to-move';

interface CategoryConfig {
  apiValue: 'new_launch' | 'ongoing' | 'ready_to_move';
  label: string;
  description: string;
}

const CATEGORY_MAP: Record<ProjectCategorySlug, CategoryConfig> = {
  'new-launch': {
    apiValue: 'new_launch',
    label: 'New Launch Projects',
    description: 'Freshly launched projects — early bird prices, best floor choices.',
  },
  ongoing: {
    apiValue: 'ongoing',
    label: 'Ongoing Projects',
    description: 'Under-construction projects with confirmed timelines.',
  },
  'ready-to-move': {
    apiValue: 'ready_to_move',
    label: 'Ready to Move',
    description: 'Move in immediately — completed, OC-received properties.',
  },
};

interface PageProps {
  params: { category: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cat = CATEGORY_MAP[params.category as ProjectCategorySlug];
  if (!cat) return {};
  return {
    title: cat.label,
    description: cat.description,
  };
}

export const dynamic = 'force-dynamic';

export default async function ProjectCategoryPage({ params, searchParams }: PageProps) {
  const cat = CATEGORY_MAP[params.category as ProjectCategorySlug];
  if (!cat) notFound();

  const page = Number(searchParams.page ?? '1');
  const sp = searchParams;

  const { properties, total, totalPages } = await getProperties({
    projectCategory: cat.apiValue,
    city: (sp.city as 'indore' | 'bhopal') || undefined,
    propertyType: (sp.propertyType as 'flat' | 'villa' | 'house' | 'plot') || undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
    sort: (sp.sort as 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'area_desc') || undefined,
    page,
    limit: 12,
  }).catch(() => ({ properties: [], total: 0, page: 1, totalPages: 0 }));

  return (
    <div className="container-site py-8">
      <h1 className="font-display text-3xl font-bold text-navy mb-2">{cat.label}</h1>
      <p className="text-gray-500 mb-8">{cat.description}</p>

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
            basePath={`/projects/${params.category}`}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
