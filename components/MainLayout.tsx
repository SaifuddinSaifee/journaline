'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';
import { useSidebar } from '@/lib/hooks/useSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Fixed Navbar */}
      <Navbar />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={cn(
        'transition-all duration-300 min-h-screen',
        className
      )}
      data-collapsed={isCollapsed}>
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout; 