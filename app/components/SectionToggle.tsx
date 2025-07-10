'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

export function SectionToggle() {
  const router = useRouter();
  const pathname = usePathname();
  
  const isEventsActive = pathname === '/events';
  const isTimelineActive = pathname === '/timeline';

  const handleToggle = (section: 'events' | 'timeline') => {
    router.push(`/${section}`);
  };

  return (
    <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full p-1 border border-gray-200/20 dark:border-gray-700/30">
      <button
        onClick={() => handleToggle('events')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          'hover:bg-white/80 dark:hover:bg-gray-700/80',
          isEventsActive 
            ? 'bg-white dark:bg-gray-700 text-text-primary shadow-sm border border-gray-200/50 dark:border-gray-600/50' 
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        Events
      </button>
      <button
        onClick={() => handleToggle('timeline')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          'hover:bg-white/80 dark:hover:bg-gray-700/80',
          isTimelineActive 
            ? 'bg-white dark:bg-gray-700 text-text-primary shadow-sm border border-gray-200/50 dark:border-gray-600/50' 
            : 'text-text-secondary hover:text-text-primary'
        )}
      >
        Timeline
      </button>
    </div>
  );
}

export default SectionToggle; 