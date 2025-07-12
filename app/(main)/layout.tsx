'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { cn } from '../../lib/utils';
import { SidebarProvider } from '../../lib/hooks/useSidebar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarProvider isCollapsed={isCollapsed} toggleSidebar={toggleSidebar}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        {/* Fixed Navbar */}
        <Navbar />
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className={cn(
          'pt-16 transition-all duration-300 min-h-screen',
          isCollapsed ? 'pl-16' : 'pl-64',
          'lg:pl-64 lg:data-[collapsed=true]:pl-16'
        )}
        data-collapsed={isCollapsed}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 