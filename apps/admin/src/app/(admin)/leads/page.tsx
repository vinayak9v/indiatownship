'use client';

import { useEffect, useState, useCallback } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { LeadTable } from '@/components/leads/LeadTable';
import { getAdminLeads } from '@/lib/api';
import type { ILead } from '@indiatownship/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_interested', label: 'Not Interested' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminLeads({ status: status || undefined, limit: 50 });
      setLeads(res.leads);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Topbar title="Leads" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-48">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{total} leads</span>
        </div>
        <div className="card p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <LeadTable leads={leads} />
          )}
        </div>
      </div>
    </>
  );
}
