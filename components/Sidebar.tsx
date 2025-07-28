'use client';

import React, { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { IoHomeOutline, IoSettingsOutline, IoGlobeOutline, IoCalendarOutline } from 'react-icons/io5';
import Calendar from './Calendar';
import TimelineList from './TimelineList';
import EventQuickAdd from './EventQuickAdd';
import { cn } from '../lib/utils';
import { useSidebar } from '../lib/hooks/useSidebar';

interface SidebarProps {
  className?: string;
}

// Settings navigation items
const settingsNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/settings',
    icon: IoHomeOutline
  },
  {
    id: 'timezone',
    label: 'Timezone',
    href: '/settings/timezone',
    icon: IoGlobeOutline
  }
];

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const pathname = usePathname();
  const params = useParams();

  // Determine current mode based on route
  const isEventsPage = pathname === '/events';
  const isTimelineEditMode = pathname?.includes('/timeline/') && pathname?.includes('/edit');
  const isSettingsPage = pathname?.startsWith('/settings');
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

  const renderSettingsSidebar = () => {
    if (isCollapsed) {
      return (
        <div className="p-2 space-y-4">
          {settingsNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                pathname === item.href
                  ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                  : 'text-gray-600 dark:text-gray-300'
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      );
    }

    return (
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
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    );
  };

  const renderContextualContent = () => {
    if (isSettingsPage) {
      return renderSettingsSidebar();
    }
    
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
          
          {/* Top Content Area */}
          <div className="flex-1 overflow-y-auto">
            {renderContextualContent()}
          </div>

          {/* Calendar Section - Only show when not in settings */}
          {!isSettingsPage && (
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
                    <IoCalendarOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          )}
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