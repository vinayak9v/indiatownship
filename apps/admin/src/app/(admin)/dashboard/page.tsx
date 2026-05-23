import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { StatCard } from '@/components/ui/StatCard';
import { getDashboardStats } from '@/lib/api';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats().catch(() => null);

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Properties" value={stats?.totalProperties ?? 0} icon="🏠" color="navy" />
          <StatCard label="Active Listings" value={stats?.activeProperties ?? 0} icon="✅" color="green" />
          <StatCard label="New Leads Today" value={stats?.newLeadsToday ?? 0} icon="📋" color="gold" />
          <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon="👥" color="navy" />
        </div>

        {/* Lead pipeline */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Lead Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'New', value: stats?.leadsByStatus.new ?? 0, color: 'bg-blue-100 text-blue-800' },
              { label: 'Contacted', value: stats?.leadsByStatus.contacted ?? 0, color: 'bg-yellow-100 text-yellow-800' },
              { label: 'Closed', value: stats?.leadsByStatus.closed ?? 0, color: 'bg-green-100 text-green-800' },
              { label: 'Not Interested', value: stats?.leadsByStatus.not_interested ?? 0, color: 'bg-gray-100 text-gray-600' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-gray-50">
                <p className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${item.color}`}>
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
