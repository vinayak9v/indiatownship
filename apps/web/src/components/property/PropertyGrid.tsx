import Link from 'next/link';
import type { IProperty } from '@indiatownship/types';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildPageUrl(
  basePath: string,
  params: Record<string, string | string[] | undefined>,
  page: number
): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (k === 'page') return;
    if (v !== undefined) p.set(k, String(v));
  });
  p.set('page', String(page));
  return `${basePath}?${p.toString()}`;
}

export function PropertyGrid({
  properties,
  total,
  page,
  totalPages,
  basePath,
  searchParams,
}: PropertyGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {total} {total === 1 ? 'property' : 'properties'} found
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No properties found matching your filters.</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={buildPageUrl(basePath, searchParams, page - 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:border-navy transition-colors"
            >
              ← Previous
            </Link>
          )}

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pg = i + 1;
            return (
              <Link
                key={pg}
                href={buildPageUrl(basePath, searchParams, pg)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  pg === page
                    ? 'bg-navy text-white'
                    : 'border border-gray-200 hover:border-navy'
                }`}
              >
                {pg}
              </Link>
            );
          })}

          {page < totalPages && (
            <Link
              href={buildPageUrl(basePath, searchParams, page + 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:border-navy transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
