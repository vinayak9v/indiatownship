import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with IndiaTownship for property inquiries, listings, and general questions.',
};

export default function ContactPage() {
  return (
    <div className="container-site py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-navy mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-10">We're here to help. Reach out and we'll respond within 2 hours.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-navy mb-1">Office</h3>
              <p className="text-gray-600 text-sm">Indore, Madhya Pradesh, India</p>
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-1">WhatsApp</h3>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}`}
                className="text-green-600 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp →
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Cities We Cover</h3>
              <p className="text-gray-600 text-sm">Indore &amp; Bhopal, Madhya Pradesh</p>
            </div>
          </div>

          {/* Contact form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
