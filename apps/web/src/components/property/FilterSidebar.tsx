'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'flat', label: 'Flat' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'House' },
  { value: 'plot', label: 'Plot' },
];

const BEDROOMS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4+ BHK' },
];

const CONSTRUCTION_STATUS = [
  { value: '', label: 'Any Status' },
  { value: 'ready_to_move', label: 'Ready to Move' },
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'new_launch', label: 'New Launch' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'area_asc', label: 'Area: Small to Large' },
];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page'); // reset to page 1 on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const get = (key: string) => searchParams.get(key) ?? '';

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="font-semibold text-navy mb-3">Property Type</h3>
        <div className="space-y-2">
          {PROPERTY_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value={opt.value}
                checked={get('propertyType') === opt.value}
                onChange={() => setParam('propertyType', opt.value)}
                className="accent-gold"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3">Budget</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min price (₹)"
            value={get('minPrice')}
            onChange={(e) => setParam('minPrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="number"
            placeholder="Max price (₹)"
            value={get('maxPrice')}
            onChange={(e) => setParam('maxPrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3">Bedrooms</h3>
        <div className="flex flex-wrap gap-2">
          {BEDROOMS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam('bedrooms', opt.value)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                get('bedrooms') === opt.value
                  ? 'bg-navy text-white border-navy'
                  : 'border-gray-200 text-gray-700 hover:border-navy'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3">Construction Status</h3>
        <select
          value={get('constructionStatus')}
          onChange={(e) => setParam('constructionStatus', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {CONSTRUCTION_STATUS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-navy mb-3">Sort By</h3>
        <select
          value={get('sort')}
          onChange={(e) => setParam('sort', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => router.push(pathname)}
        className="w-full text-sm text-gray-500 hover:text-navy underline text-center"
      >
        Clear all filters
      </button>
    </aside>
  );
}
