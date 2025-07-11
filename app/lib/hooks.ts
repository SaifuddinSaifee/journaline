import { useState, useEffect, useMemo, useCallback } from 'react';
import { Event } from './types';
import { eventService } from './eventService';
import { isWithinInterval, parseISO } from 'date-fns';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface UseTimelineEventsOptions {
  timelineId?: string;
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
  const { timelineId, dateRange } = options;

  const loadEvents = useCallback(async () => {
    if (!timelineId) {
      setEvents([]);
      setLoading(false);
      return;
    }
      
    setLoading(true);
    setError(null);
    
    try {
      // Get events for a specific timeline
      const result = await eventService.getEventsByTimelineId(timelineId);

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
  }, [timelineId]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Listen for custom events when events are updated within the same tab
  useEffect(() => {
    const handleEventUpdate = () => {
      loadEvents();
    };

    window.addEventListener('events-updated', handleEventUpdate);
    return () => window.removeEventListener('events-updated', handleEventUpdate);
  }, [loadEvents]);

  // Filter events by date range if provided
  const filteredEvents = useMemo(() => {
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      return events.filter(event => {
        const eventDate = parseISO(event.date);
        return isWithinInterval(eventDate, {
          start: dateRange.startDate!,
          end: dateRange.endDate!,
        });
      });
    }
    return events;
  }, [events, dateRange]);

  return {
    events: filteredEvents,
    loading,
    error,
    refetch: loadEvents,
  };
} 