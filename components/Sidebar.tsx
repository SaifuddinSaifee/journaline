'use client';

import React, { useState } from 'react';
import GlassButton from './GlassButton';
import Calendar from './Calendar';
import { cn } from '../lib/utils';
import { useSidebar } from '../lib/hooks/useSidebar';
import { IoChevronBack } from 'react-icons/io5';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    // Create a new date at noon to avoid timezone issues
    const adjustedDate = new Date(date);
    adjustedDate.setHours(12, 0, 0, 0);
    
    setSelectedDate(adjustedDate);
    
    // Dispatch custom event for the Events component to listen to
    const event = new CustomEvent('calendar-date-selected', {
      detail: { date: adjustedDate }
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
        <div className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30 relative flex flex-col">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20 flex items-center justify-end flex-shrink-0">
            {/* Standard Collapse Toggle */}
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-12 h-12 p-0 flex items-center justify-center hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <IoChevronBack
                className={cn(
                  'w-7 h-7 transition-transform duration-300 text-text-secondary hover:text-text-primary',
                  isCollapsed ? 'rotate-180' : ''
                )}
              />
            </GlassButton>
          </div>

          {/* Top Content Area - Space for future content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!isCollapsed ? (
              <div className="space-y-4">
                {/* Future content can go here */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {/* This area is available for future sidebar content */}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Collapsed state icons for future content */}
              </div>
            )}
          </div>

          {/* Calendar Section - Anchored to bottom */}
          <div className="flex-shrink-0 border-t border-gray-200/20 dark:border-gray-700/20">
            {!isCollapsed ? (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            ) : (
              <div className="p-2 flex justify-center">
                {/* Collapsed state - minimal calendar icon */}
                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">📅</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export default Sidebar; 