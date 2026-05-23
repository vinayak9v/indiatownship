import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { PropertyForm } from '@/components/properties/PropertyForm';

export const metadata: Metadata = { title: 'Add Property' };

export default function NewPropertyPage() {
  return (
    <>
      <Topbar title="Add Property" />
      <div className="p-6">
        <PropertyForm />
      </div>
    </>
  );
}
