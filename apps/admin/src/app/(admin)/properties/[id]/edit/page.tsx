import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { getAdminProperty } from '@/lib/api';

export const metadata: Metadata = { title: 'Edit Property' };
export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  let property;
  try {
    property = await getAdminProperty(params.id);
  } catch {
    return notFound();
  }

  return (
    <>
      <Topbar title="Edit Property" />
      <div className="p-6">
        <PropertyForm property={property} />
      </div>
    </>
  );
}
