import type { IProperty } from '@indiatownship/types';
import { PropertyCard } from '@/components/property/PropertyCard';

interface LuxurySectionProps {
  properties: IProperty[];
}

export function LuxurySection({ properties }: LuxurySectionProps) {
  if (!properties.length) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-site">
        <h2 className="font-display text-3xl font-bold text-navy mb-8">
          Luxury Properties
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 6).map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
