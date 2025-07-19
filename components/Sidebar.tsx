'use client';

import React, { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import GlassButton from './GlassButton';
import Calendar from './Calendar';
import TimelineList from './TimelineList';
import EventQuickAdd from './EventQuickAdd';
import { cn } from '../lib/utils';
import { useSidebar } from '../lib/hooks/useSidebar';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useParams();

  // Determine current mode based on route
  const isEventsPage = pathname === '/events';
  const isTimelineEditMode = pathname?.includes('/timeline/') && pathname?.includes('/edit');
  const timelineId = isTimelineEditMode ? (typeof params?.id === 'string' ? params.id : '') : '';

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

  const handleCalendarCollapseChange = (collapsed: boolean) => {
    setIsCalendarCollapsed(collapsed);
  };

  const renderContextualContent = () => {
    if (isEventsPage) {
      return <TimelineList isCollapsed={isCollapsed} />;
    } else if (isTimelineEditMode && timelineId) {
      return <EventQuickAdd isCollapsed={isCollapsed} timelineId={timelineId} />;
    } else {
      // Default content for other pages
      return !isCollapsed ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {/* This area is available for future sidebar content */}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Collapsed state icons for future content */}
        </div>
      );
    }
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
          
          {/* Top Content Area - Contextual content extends to just above Add Event button */}
          <div className="flex-1 overflow-y-auto p-4 pb-0">
            {renderContextualContent()}
          </div>

          {/* Calendar Section - Always anchored to bottom, contains Add Event button */}
          <div className="flex-shrink-0 border-t border-gray-200/20 dark:border-gray-700/20">
            {!isCollapsed ? (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onCollapseChange={handleCalendarCollapseChange}
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