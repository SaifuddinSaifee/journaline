'use client';

import { useState } from 'react';
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from '@/lib/hooks/useSidebar';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <ThemeProvider>
      <SidebarProvider isCollapsed={isCollapsed} toggleSidebar={toggleSidebar}>
        {children}
      </SidebarProvider>
    </ThemeProvider>
  );
} 