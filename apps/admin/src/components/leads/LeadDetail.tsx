'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ILead } from '@indiatownship/types';
import { updateLead } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

type LeadStatus = 'new' | 'contacted' | 'closed' | 'not_interested';

export function LeadDetail({ lead }: { lead: ILead }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status as LeadStatus);
  const [notes, setNotes] = useState(lead.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateLead(String(lead._id), { status, adminNotes: notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const propertyTitle = typeof lead.property === 'string'
    ? lead.property
    : (lead.property as { title?: string })?.title ?? '—';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contact info */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Lead Details</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Name', value: lead.name },
              { label: 'Phone', value: lead.phone },
              { label: 'Email', value: lead.email || '—' },
              { label: 'Property', value: propertyTitle },
              { label: 'Source', value: lead.source.replace(/_/g, ' ') },
              { label: 'WhatsApp Notified', value: lead.whatsappSent ? '✅ Yes' : '❌ No' },
              { label: 'Received', value: new Date(lead.createdAt).toLocaleString('en-IN') },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <dt className="w-36 text-gray-500 shrink-0">{label}</dt>
                <dd className="text-gray-900 capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {lead.message && (
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Message</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{lead.message}</p>
          </div>
        )}
      </div>

      {/* Status + Notes */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Update Status</h2>
          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="input"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed (Deal Done)</option>
              <option value="not_interested">Not Interested</option>
            </select>
            <div className="mt-2">
              <Badge status={status} />
            </div>
          </div>
          <div>
            <label className="label">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="input resize-none"
              placeholder="Call outcome, follow-up date..."
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
