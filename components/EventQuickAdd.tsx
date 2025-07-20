'use client';

import React, { useState, useEffect } from 'react';
import { Event } from '../lib/types';
import { eventService } from '../lib/eventService';
import { IoCalendarOutline, IoAdd, IoCheckmark, IoSearchOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import GlassButton from './GlassButton';

interface EventQuickAddProps {
  isCollapsed: boolean;
  timelineId: string;
  onEventAdded?: () => void;
}

export function EventQuickAdd({ isCollapsed, timelineId, onEventAdded }: EventQuickAddProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingEventIds, setAddingEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEvents();
  }, []);

  // Listen for events updates
  useEffect(() => {
    const handleEventUpdate = () => {
      console.log('EventQuickAdd: Received events-updated event, refreshing event list...');
      loadEvents();
    };

    window.addEventListener('events-updated', handleEventUpdate);
    return () => window.removeEventListener('events-updated', handleEventUpdate);
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await eventService.getAllEvents();
      if (fetchError) {
        setError(fetchError);
        setEvents([]);
      } else if (data) {
        // Filter out events that are already in this timeline - show ALL available events
        const availableEvents = data
          .filter(event => !event.timelineIds.includes(timelineId))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first
        setEvents(availableEvents);
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (event: Event) => {
    if (addingEventIds.has(event.id)) return;

    setAddingEventIds(prev => new Set(prev).add(event.id));

    try {
      const updatedTimelineIds = [...event.timelineIds, timelineId];
      const result = await eventService.updateEvent(event.id, {
        timelineIds: updatedTimelineIds
      });

      if (result.error) {
        console.error('Error adding event to timeline:', result.error);
      } else {
        // Remove the event from the available list
        setEvents(prev => prev.filter(e => e.id !== event.id));
        
        // Dispatch event to notify other components
        const updateEvent = new CustomEvent('events-updated');
        window.dispatchEvent(updateEvent);
        
        // Call callback if provided
        onEventAdded?.();
      }
    } catch (err) {
      console.error('Error adding event to timeline:', err);
    } finally {
      setAddingEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower)
    );
  });

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <div className="w-full h-10 flex items-center justify-center">
          <IoCalendarOutline className="w-5 h-5 text-text-secondary" title="Available Events" />
        </div>
        {!loading && filteredEvents.slice(0, 2).map((event) => (
          <GlassButton
            key={event.id}
            variant="ghost"
            size="sm"
            onClick={() => handleAddEvent(event)}
            disabled={addingEventIds.has(event.id)}
            className="w-full h-10 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50"
            title={`Add "${event.title}" to timeline`}
          >
            {addingEventIds.has(event.id) ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
            ) : (
              <IoAdd className="w-4 h-4" />
            )}
          </GlassButton>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center gap-2">
        <IoCalendarOutline className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-medium text-text-primary">Add Events</h3>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 pl-8 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <IoSearchOutline className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-xs text-text-secondary mt-1">Loading...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-2">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-4">
          <IoCheckmark className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-xs text-text-secondary">All events are already in this timeline</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-2 overflow-y-auto">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isAdding = addingEventIds.has(event.id);
            
            return (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 shadow-sm hover:shadow-md transition-all duration-200 group backdrop-blur-sm hover:bg-gray-50/80 dark:hover:bg-gray-700/60"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary truncate">
                      {event.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <IoCalendarOutline className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {format(eventDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddEvent(event)}
                    disabled={isAdding}
                    className="h-8 w-8 p-0 flex items-center justify-center text-text-secondary hover:text-blue-500 disabled:opacity-50 flex-shrink-0"
                    title="Add to timeline"
                  >
                    {isAdding ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
                    ) : (
                      <IoAdd className="w-4 h-4" />
                    )}
                  </GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventQuickAdd; 