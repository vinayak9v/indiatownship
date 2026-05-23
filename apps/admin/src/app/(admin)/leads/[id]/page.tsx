import { notFound } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { getAdminLead } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  let lead;
  try {
    lead = await getAdminLead(params.id);
  } catch {
    return notFound();
  }

  return (
    <>
      <Topbar title={`Lead: ${lead.name}`} />
      <div className="p-6">
        <LeadDetail lead={lead} />
      </div>
    </>
  );
}
