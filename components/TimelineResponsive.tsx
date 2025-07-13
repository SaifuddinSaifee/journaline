'use client';

import React from 'react';
import { Event } from '../lib/types';
import TimelineCard from './TimelineCard';
import { motion } from 'framer-motion';

interface TimelineResponsiveProps {
  events: Event[];
  mode?: 'view' | 'edit';
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  label: string;
}

export function TimelineResponsive({ events, mode = 'view', onEdit, onDelete, label }: TimelineResponsiveProps) {
  return (
    <div className="relative pl-8 pr-4">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600" />
      
      {/* Date label */}
      <div className="absolute left-0 top-4 z-10">
        <div className="bg-white z-[40] dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {label}
          </span>
        </div>
        {/* Horizontal connector line */}
        <div className="absolute top-1/2 z-10 left-full w-4 h-0.5 bg-blue-500 dark:bg-blue-400 transform -translate-y-1/2" />
      </div>

      {/* Events stack */}
      <div className="space-y-4 pt-12">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TimelineCard
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              mode={mode}
              className="transform transition-all duration-300 hover:translate-x-1 hover:scale-[1.02]"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default TimelineResponsive; 