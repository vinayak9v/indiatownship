import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'IndiaTownship — your trusted real estate partner in Indore and Bhopal with verified listings and expert guidance.',
};

export default function AboutPage() {
  return (
    <div className="container-site py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-navy mb-6">About IndiaTownship</h1>

        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          IndiaTownship is Madhya Pradesh's premium real estate portal, dedicated to helping you find, buy, rent, and sell properties in Indore and Bhopal.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          We believe buying a property should be simple, transparent, and trustworthy. Every listing on IndiaTownship is verified by our team before going live. We work directly with developers and property owners to bring you accurate details, professional photography, and fair pricing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {[
            { label: 'Verified Listings', value: '100%', desc: 'Every property manually verified' },
            { label: 'Cities Covered', value: '2', desc: 'Indore & Bhopal (and growing)' },
            { label: 'Response Time', value: '< 2hr', desc: 'Average lead response time' },
            { label: 'Expert Team', value: '5+', desc: 'Years of local market experience' },
          ].map((stat) => (
            <div key={stat.label} className="p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gold">{stat.value}</p>
              <p className="font-semibold text-navy mt-1">{stat.label}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
