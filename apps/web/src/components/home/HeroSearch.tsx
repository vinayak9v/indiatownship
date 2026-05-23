'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'buy' | 'rent' | 'sell';

const CITIES = [
  { value: 'indore', label: 'Indore' },
  { value: 'bhopal', label: 'Bhopal' },
];

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('buy');
  const [city, setCity] = useState('indore');
  const [keyword, setKeyword] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (tab === 'sell') {
      router.push('/sell');
      return;
    }
    const params = new URLSearchParams();
    if (keyword) params.set('locality', keyword);
    const qs = params.toString() ? `?${params.toString()}` : '';
    router.push(`/${tab}/${city}${qs}`);
  }

  return (
    <div className="bg-navy rounded-2xl p-6 md:p-8 shadow-xl">
      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800 rounded-lg p-1 w-fit mb-6">
        {(['buy', 'rent', 'sell'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? 'bg-gold text-navy'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        {tab !== 'sell' && (
          <>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="md:w-40 px-4 py-3 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by locality, project name..."
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </>
        )}

        {tab === 'sell' && (
          <p className="flex-1 py-3 text-gray-300 text-sm">
            List your property with IndiaTownship — reach thousands of buyers.
          </p>
        )}

        <button type="submit" className="btn-primary whitespace-nowrap">
          {tab === 'sell' ? 'Get Started' : 'Search'}
        </button>
      </form>
    </div>
  );
}
