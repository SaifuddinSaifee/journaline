'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Define settings navigation items
const settingsNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/settings',
    icon: '🏠'
  },
  {
    id: 'timezone',
    label: 'Timezone',
    href: '/settings/timezone',
    icon: '🌐'
  },
  // Add more settings categories here
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30">
      <nav className="p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-4 px-2">Settings</h2>
        
        {settingsNavItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              pathname === item.href
                ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                : 'text-gray-600 dark:text-gray-300'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 