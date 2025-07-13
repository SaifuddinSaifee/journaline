'use client';

import React, { useState, createContext, useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a MainLayout');
  }
  return context;
};

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
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
    </SidebarContext.Provider>
  );
}

export default MainLayout; 