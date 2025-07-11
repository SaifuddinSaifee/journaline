'use client';

import React, { useState } from 'react';
import GlassButton from './GlassButton';
import Calendar from './Calendar';
import { cn } from '../lib/utils';
import { useSidebar } from './MainLayout';
import { IoChevronBack } from 'react-icons/io5';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Dispatch custom event for the Events component to listen to
    const event = new CustomEvent('calendar-date-selected', {
      detail: { date }
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}>
        <div className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30">
          {/* Toggle Button */}
          <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-center"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <IoChevronBack
                className={cn(
                  'w-5 h-5 transition-transform duration-300',
                  isCollapsed ? 'rotate-180' : ''
                )}
              />
            </GlassButton>
          </div>

          {/* Calendar */}
          <div className="flex-1 overflow-y-auto">
            {!isCollapsed && (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export default Sidebar; 