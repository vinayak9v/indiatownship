'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { IProperty } from '@indiatownship/types';
import { togglePropertyActive, deleteProperty } from '@/lib/api';

interface PropertyTableProps {
  properties: IProperty[];
  onRefresh: () => void;
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function PropertyTable({ properties, onRefresh }: PropertyTableProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      await togglePropertyActive(id);
      onRefresh();
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProperty(id);
      onRefresh();
    } finally {
      setDeleting(null);
    }
  }

  if (!properties.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No properties found. <Link href="/properties/new" className="text-navy underline">Add one →</Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="pb-3 font-medium pr-4">Property</th>
            <th className="pb-3 font-medium pr-4">City</th>
            <th className="pb-3 font-medium pr-4">Price</th>
            <th className="pb-3 font-medium pr-4">Type</th>
            <th className="pb-3 font-medium pr-4">Status</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {properties.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4">
                <div className="font-medium text-gray-900 truncate max-w-xs">{p.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.locality}</div>
              </td>
              <td className="py-3 pr-4 capitalize">{p.city}</td>
              <td className="py-3 pr-4 font-medium">{formatPrice(p.price)}</td>
              <td className="py-3 pr-4 capitalize">{p.propertyType}</td>
              <td className="py-3 pr-4">
                <button
                  onClick={() => handleToggle(p._id)}
                  disabled={toggling === p._id}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    p.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {toggling === p._id ? '...' : p.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/properties/${p._id}/edit`} className="text-navy hover:underline text-xs">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id, p.title)}
                    disabled={deleting === p._id}
                    className="text-red-500 hover:underline text-xs disabled:opacity-50"
                  >
                    {deleting === p._id ? '...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
