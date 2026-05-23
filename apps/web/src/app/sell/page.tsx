import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Property',
  description: 'List your property with IndiaTownship and reach thousands of verified buyers in Indore and Bhopal.',
};

export default function SellPage() {
  return (
    <div className="container-site py-16">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-navy">Sell Your Property</h1>
        <p className="text-gray-600 mt-4 text-lg">
          List with IndiaTownship and reach thousands of verified buyers in Indore and Bhopal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { step: '1', title: 'Contact Us', desc: 'Call or WhatsApp our team with your property details.' },
          { step: '2', title: 'We List It', desc: 'Our team photographs and lists your property professionally.' },
          { step: '3', title: 'Get Leads', desc: 'Receive verified buyer inquiries directly.' },
        ].map((item) => (
          <div key={item.step} className="text-center p-6 border border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-navy text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
              {item.step}
            </div>
            <h3 className="font-semibold text-navy text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}?text=${encodeURIComponent('Hi! I want to list my property with IndiaTownship.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          💬 Chat with Us on WhatsApp
        </a>
      </div>
    </div>
  );
}
