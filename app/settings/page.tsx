'use client';

import React from 'react';
import Link from 'next/link';
import { IoHomeOutline, IoGlobeOutline, IoSettingsOutline } from 'react-icons/io5';
import { GlassCard } from '@/components/GlassCard';

// Settings categories with proper icons
const settingsCategories = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/settings',
    icon: IoHomeOutline,
    description: 'Overview of all available settings and configurations.'
  },
  {
    id: 'timezone',
    label: 'Timezone',
    href: '/settings/timezone',
    icon: IoGlobeOutline,
    description: 'Configure your timezone preferences for accurate event timing.'
  },
  // Add more settings categories here as needed
];

export default function SettingsDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IoSettingsOutline className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your Journaline preferences and configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Link key={category.id} href={category.href}>
            <GlassCard className="h-full transition-transform hover:scale-105">
              <div className="p-6">
                <div className="mb-4">
                  <category.icon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{category.label}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
} 