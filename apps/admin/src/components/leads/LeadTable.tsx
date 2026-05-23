import Link from 'next/link';
import type { ILead } from '@indiatownship/types';
import { Badge } from '@/components/ui/Badge';

interface LeadTableProps {
  leads: ILead[];
}

export function LeadTable({ leads }: LeadTableProps) {
  if (!leads.length) {
    return <div className="text-center py-12 text-gray-500">No leads found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="pb-3 font-medium pr-4">Contact</th>
            <th className="pb-3 font-medium pr-4">Property</th>
            <th className="pb-3 font-medium pr-4">Source</th>
            <th className="pb-3 font-medium pr-4">Status</th>
            <th className="pb-3 font-medium pr-4">Date</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map((lead) => (
            <tr key={String(lead._id)} className="hover:bg-gray-50">
              <td className="py-3 pr-4">
                <div className="font-medium text-gray-900">{lead.name}</div>
                <div className="text-xs text-gray-400">{lead.phone}</div>
              </td>
              <td className="py-3 pr-4 text-gray-600 truncate max-w-[160px]">
                {typeof lead.property === 'string' ? lead.property : (lead.property as { title?: string })?.title ?? '—'}
              </td>
              <td className="py-3 pr-4 capitalize text-gray-500">{lead.source.replace('_', ' ')}</td>
              <td className="py-3 pr-4">
                <Badge status={lead.status as 'new' | 'contacted' | 'closed' | 'not_interested'} />
              </td>
              <td className="py-3 pr-4 text-gray-400 text-xs">
                {new Date(lead.createdAt).toLocaleDateString('en-IN')}
              </td>
              <td className="py-3">
                <Link href={`/leads/${String(lead._id)}`} className="text-navy hover:underline text-xs">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
