'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { getAdminProperties } from '@/lib/api';
import type { IProperty } from '@indiatownship/types';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProperties({ search, limit: 50 });
      setProperties(res.properties);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Topbar title="Properties" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-64"
            />
            <span className="text-sm text-gray-500">{total} total</span>
          </div>
          <Link href="/properties/new" className="btn-primary">
            + Add Property
          </Link>
        </div>

        <div className="card p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <PropertyTable properties={properties} onRefresh={load} />
          )}
        </div>
      </div>
    </>
  );
}
