'use client';

import { useRef } from 'react';
import type { IProperty } from '@indiatownship/types';
import { PropertyCard } from '@/components/property/PropertyCard';

interface FeaturedSliderProps {
  properties: IProperty[];
}

export function FeaturedSlider({ properties }: FeaturedSliderProps) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  }

  if (!properties.length) return null;

  return (
    <section className="py-12">
      <div className="container-site">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold text-navy">Featured Projects</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-200 hover:border-navy transition-colors"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-200 hover:border-navy transition-colors"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((p) => (
            <div key={p._id} className="snap-start shrink-0 w-72 md:w-80">
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
