'use client';

import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex min-h-screen pt-16">
        {/* Settings Sidebar */}
        <SettingsSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </MainLayout>
  );
} 