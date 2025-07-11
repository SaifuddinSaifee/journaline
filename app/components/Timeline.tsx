'use client';

import React, { useState } from 'react';
import { IoTimeOutline, IoCalendarOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { useTimelineEvents } from '../lib/hooks';
import { Event } from '../lib/types';
import { eventService } from '../lib/eventService';
import GlassCard from './GlassCard';
import TimelineCard from './TimelineCard';
import DateRangeSelector, { DateRange } from './DateRangeSelector';

export function Timeline() {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const { events, loading, error } = useTimelineEvents({ dateRange });
  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);

  // Keep local state in sync with hook
  React.useEffect(() => {
    setTimelineEvents(events);
  }, [events]);

  const handleEditEvent = async (updatedEvent: Event) => {
    try {
      const result = await eventService.updateEvent(updatedEvent.id, {
        title: updatedEvent.title,
        description: updatedEvent.description,
        addToTimeline: updatedEvent.addToTimeline,
      });

      if (result.error) {
        console.error('Error updating event:', result.error);
      } else if (result.data) {
        // Update local state
        setTimelineEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? result.data! : event
        ));
        
        // Dispatch custom event to notify other components
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('Error updating event:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const result = await eventService.deleteEvent(eventId);

      if (result.error) {
        console.error('Error deleting event:', result.error);
      } else {
        // Update local state
        setTimelineEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Dispatch custom event to notify other components
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

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
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Timeline
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Your chronological journey through events marked for timeline display.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-text-secondary">
                  {timelineEvents.length} event{timelineEvents.length !== 1 ? 's' : ''} 
                  {dateRange.startDate && dateRange.endDate ? ' in selected range' : ' in timeline'}
                </span>
              </div>
              <DateRangeSelector
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="text-center py-12">
              <IoCalendarOutline className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {dateRange.startDate && dateRange.endDate ? 'No events in selected range' : 'No timeline events yet'}
              </h3>
              <p className="text-text-secondary mb-4">
                {dateRange.startDate && dateRange.endDate 
                  ? 'Try adjusting your date range or create new events in this period.'
                  : 'Create journal entries and mark them with "Add to timeline" to see them here.'
                }
              </p>
              <p className="text-text-muted text-sm">
                Your timeline will display events chronologically from newest to oldest.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Timeline Container */}
              <div className="relative">
                {/* Center Timeline Line - Hidden on mobile, visible on desktop */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                {/* Mobile Timeline Line - Visible on mobile only */}
                <div className="md:hidden absolute left-4 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                {/* Timeline Events */}
                <div className="space-y-8">
                  {timelineEvents.map((event, index) => {
                    const isEven = index % 2 === 0;
                    const eventDate = new Date(event.date);
                    
                    return (
                      <div key={event.id} className="relative">
                        {/* Center Date Marker - Desktop */}
                        <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          {/* Date Label */}
                          <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {format(eventDate, 'MMM d')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mobile Date Indicator */}
                        <div className="md:hidden absolute left-2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {format(eventDate, 'MMM d')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mobile Connection Line */}
                        <div className="md:hidden absolute left-8 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 z-10" />
                        
                        {/* Timeline Card */}
                        <div className={`
                          md:flex 
                          ${isEven ? 'md:justify-start' : 'md:justify-end'}
                          ml-8 md:ml-0
                        `}>
                          <div className={`
                            w-full 
                            md:max-w-md 
                            ${isEven ? 'md:pr-8' : 'md:pl-8'}
                            relative
                          `}>
                            {/* Connection Line - Desktop only */}
                            <div className={`
                              hidden md:block absolute top-1/2 transform -translate-y-1/2 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 z-10
                              ${isEven 
                                ? 'left-full w-8' 
                                : 'right-full w-8'
                              }
                            `} />
                            
                            {/* Timeline Card */}
                            <TimelineCard 
                              event={event} 
                              onEdit={handleEditEvent}
                              onDelete={handleDeleteEvent}
                              className={`
                                transform transition-all duration-300 hover:scale-[1.02] 
                                ${isEven ? 'md:hover:translate-x-1' : 'md:hover:-translate-x-1'}
                              `} 
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