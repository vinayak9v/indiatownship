import Link from 'next/link';

const CITIES = [
  {
    name: 'Indore',
    slug: 'indore',
    description: "MP's commercial capital — IT hubs, residential growth",
    bgColor: 'bg-navy',
  },
  {
    name: 'Bhopal',
    slug: 'bhopal',
    description: 'State capital — lakes, greenery, emerging real estate',
    bgColor: 'bg-gold',
  },
];

export function CityCards() {
  return (
    <section className="py-12">
      <div className="container-site">
        <h2 className="font-display text-3xl font-bold text-navy mb-8 text-center">
          Explore by City
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/buy/${city.slug}`}
              className={`${city.bgColor} text-white rounded-2xl p-8 hover:opacity-90 transition-opacity group`}
            >
              <h3 className="font-display text-2xl font-bold">{city.name}</h3>
              <p className="text-sm mt-2 opacity-80">{city.description}</p>
              <span className="inline-block mt-4 text-sm font-semibold group-hover:underline">
                Browse Properties →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
