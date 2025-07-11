import { useState, useEffect, useMemo, useCallback } from 'react';
import { Event } from './types';
import { eventService } from './eventService';
import { isWithinInterval, parseISO } from 'date-fns';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface UseTimelineEventsOptions {
  dateRange?: DateRange;
}

interface UseTimelineEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTimelineEvents(options: UseTimelineEventsOptions = {}): UseTimelineEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dateRange } = options;

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        // Get events within date range
        result = await eventService.getEventsByDateRange(
          dateRange.startDate.toISOString(),
          dateRange.endDate.toISOString()
        );
      } else {
        // Get timeline events
        result = await eventService.getTimelineEvents();
      }

      if (result.error) {
        setError(result.error);
        setEvents([]);
      } else if (result.data) {
        setEvents(result.data);
      }
    } catch (err) {
      console.error('Error loading timeline events:', err);
      setError('Failed to load timeline events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Listen for localStorage changes to update events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'journaline-events') {
        loadEvents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadEvents]);

  // Listen for custom events when events are updated within the same tab
  useEffect(() => {
    const handleEventUpdate = () => {
      loadEvents();
    };

    window.addEventListener('events-updated', handleEventUpdate);
    return () => window.removeEventListener('events-updated', handleEventUpdate);
  }, [loadEvents]);

  // Filter, sort, and apply date range to timeline events
  const timelineEvents = useMemo(() => {
    let filteredEvents = events.filter(event => event.addToTimeline);
    
    // Apply date range filter
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = parseISO(event.date);
        return isWithinInterval(eventDate, {
          start: dateRange.startDate!,
          end: dateRange.endDate!,
        });
      });
    }
    
    // Sort chronologically (newest to oldest)
    return filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, dateRange]);

  return {
    events: timelineEvents,
    loading,
    error,
    refetch: loadEvents,
  };
} 