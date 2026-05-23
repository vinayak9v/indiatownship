'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Properties', href: '/properties', icon: '🏠' },
  { label: 'Leads', href: '/leads', icon: '📋' },
  { label: 'Users', href: '/users', icon: '👥' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-navy min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-navy-800">
        <span className="font-bold text-white text-lg">
          India<span className="text-gold">Township</span>
        </span>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-gold text-navy'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
