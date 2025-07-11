'use client';

import React from 'react';
import { format } from 'date-fns';
import { IoTimeOutline } from 'react-icons/io5';
import { Event } from '../lib/types';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';

interface TimelineCardProps {
  event: Event;
  className?: string;
}

export function TimelineCard({ event, className }: TimelineCardProps) {
  const eventDate = new Date(event.date);
  
  return (
    <GlassCard 
      variant="secondary" 
      className={cn(
        'relative p-4 hover:shadow-lg transition-all duration-200',
        'border-l-4 border-blue-500 dark:border-blue-400',
        className
      )}
    >
      {/* Date Badge */}
      <div className="flex items-center gap-2 mb-3">
        <IoTimeOutline className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {format(eventDate, 'MMM d, yyyy')}
        </span>
        <span className="text-xs text-text-muted">
          {format(eventDate, 'h:mm a')}
        </span>
      </div>
      
      {/* Event Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-text-primary text-lg leading-tight">
          {event.title}
        </h3>
        
        <div className="text-text-secondary text-sm leading-relaxed">
          {event.description.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < event.description.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Timeline Badge */}
      <div className="absolute top-2 right-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Timeline
        </span>
      </div>
    </GlassCard>
  );
}

export default TimelineCard; 