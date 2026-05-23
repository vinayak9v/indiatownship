'use client';

import { useRouter } from 'next/navigation';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <h1 className="font-semibold text-gray-900 text-base">{title}</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        Sign out
      </button>
    </header>
  );
}
