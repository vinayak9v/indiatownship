'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { getAdminUsers, updateAdminUser, type IAdminUser } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await getAdminUsers({ limit: 100 });
      setUsers(res.users);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id: string, isActive: boolean) {
    setToggling(id);
    try {
      await updateAdminUser(id, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !isActive } : u));
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
      <Topbar title="Users" />
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-4">{total} registered users</p>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{user.name}</td>
                  <td className="px-5 py-3 text-gray-600">{user.phone}</td>
                  <td className="px-5 py-3 text-gray-600">{user.email || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(user._id, user.isActive)}
                      disabled={toggling === user._id || user.role === 'admin'}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors disabled:opacity-40 ${
                        user.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {toggling === user._id ? '...' : user.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
