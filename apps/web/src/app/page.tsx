import { HeroSearch } from '@/components/home/HeroSearch';
import { FeaturedSlider } from '@/components/home/FeaturedSlider';
import { LuxurySection } from '@/components/home/LuxurySection';
import { CityCards } from '@/components/home/CityCards';
import { getFeaturedProperties, getLuxuryProperties } from '@/lib/api';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HomePage() {
  const [featured, luxury] = await Promise.all([
    getFeaturedProperties({ next: { revalidate: 3600 } }).catch(() => []),
    getLuxuryProperties({ next: { revalidate: 3600 } }).catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-navy-800 py-16 md:py-24">
        <div className="container-site">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Find Your Dream Property in{' '}
              <span className="text-gold">Indore &amp; Bhopal</span>
            </h1>
            <p className="mt-4 text-gray-300 text-lg">
              Verified listings. Expert team. Best prices.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <FeaturedSlider properties={featured} />

      {/* Luxury Properties */}
      <LuxurySection properties={luxury} />

      {/* Why IndiaTownship */}
      <section className="py-12 bg-white">
        <div className="container-site">
          <h2 className="font-display text-3xl font-bold text-navy mb-8 text-center">
            Why IndiaTownship?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: 'Verified Listings', desc: 'All properties verified by our team before listing.' },
              { icon: '👥', title: 'Expert Team', desc: 'Dedicated agents with deep local market knowledge.' },
              { icon: '⚡', title: 'Instant Alerts', desc: 'Get notified the moment a matching property is listed.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl border border-gray-100 hover:border-gold transition-colors">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-navy text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City Cards */}
      <CityCards />
    </>
  );
}
