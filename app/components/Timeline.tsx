'use client';

import React from 'react';
import { IoTimeOutline, IoCalendarOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { useTimelineEvents } from '../lib/hooks';
import GlassCard from './GlassCard';
import TimelineCard from './TimelineCard';

export function Timeline() {
  const { events, loading, error } = useTimelineEvents();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="default" className="min-h-96">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading timeline...</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <GlassCard variant="default" className="min-h-96">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">Error loading timeline</p>
              <p className="text-text-secondary text-sm">{error}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <GlassCard variant="default" className="min-h-96">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Timeline
            </h2>
            <p className="text-text-secondary">
              Your chronological journey through events marked for timeline display.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <IoCalendarOutline className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No timeline events yet
              </h3>
              <p className="text-text-secondary mb-4">
                Create journal entries and mark them with "Add to timeline" to see them here.
              </p>
              <p className="text-text-muted text-sm">
                Your timeline will display events chronologically from newest to oldest.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Timeline Header */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <IoTimeOutline className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-text-secondary">
                  {events.length} event{events.length !== 1 ? 's' : ''} in timeline
                </span>
              </div>

              {/* Timeline Container */}
              <div className="relative">
                {/* Center Timeline Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                {/* Timeline Events */}
                <div className="space-y-8">
                  {events.map((event, index) => {
                    const isEven = index % 2 === 0;
                    const eventDate = new Date(event.date);
                    
                    return (
                      <div key={event.id} className="relative">
                        {/* Center Date Marker */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                          <div className="flex flex-col items-center">
                            {/* Timeline Dot */}
                            <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full shadow-lg border-2 border-white dark:border-gray-900 mb-2" />
                            
                            {/* Date Label */}
                            <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {format(eventDate, 'MMM d')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Timeline Card - Alternating Left/Right */}
                        <div className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                          <div className={`w-full max-w-md ${isEven ? 'pr-8' : 'pl-8'}`}>
                            {/* Connection Line */}
                            <div className={`absolute top-4 w-6 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-60 ${
                              isEven 
                                ? 'right-1/2 transform translate-x-2' 
                                : 'left-1/2 transform -translate-x-2'
                            }`} />
                            
                            {/* Timeline Card */}
                            <TimelineCard 
                              event={event} 
                              className={`transform transition-all duration-300 hover:scale-105 ${
                                isEven ? 'hover:translate-x-2' : 'hover:-translate-x-2'
                              }`} 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default Timeline; 