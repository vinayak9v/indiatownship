'use client';

import { useState } from 'react';
import { submitLead } from '@/lib/api';

interface BrochureGateProps {
  propertyId: string;
}

export function BrochureGate({ propertyId }: BrochureGateProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) { setError('Phone number is required.'); return; }
    setStatus('loading');
    setError('');
    try {
      const res = await submitLead({
        property: propertyId,
        name: 'Brochure Request',
        phone,
        source: 'brochure_gate',
      });
      if (res.brochureUrl) {
        window.open(res.brochureUrl, '_blank');
        setStatus('success');
      } else {
        setError('Brochure not available. Please contact us directly.');
        setStatus('idle');
      }
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full btn-outline text-center"
      >
        📄 Download Brochure
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-navy mb-1">
              Get Brochure
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your phone number to download the brochure.
            </p>

            {status === 'success' ? (
              <p className="text-green-600 font-medium text-center py-4">
                ✓ Download started!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-primary disabled:opacity-60"
                >
                  {status === 'loading' ? 'Processing...' : 'Download'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
