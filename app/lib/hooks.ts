import { useState, useEffect, useMemo } from 'react';
import { Event } from './types';

interface UseTimelineEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTimelineEvents(): UseTimelineEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = () => {
    setLoading(true);
    setError(null);
    
    try {
      const savedEvents = localStorage.getItem('journaline-events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents) as Event[];
        setEvents(parsedEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Listen for localStorage changes to update events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'journaline-events') {
        loadEvents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom events when events are updated within the same tab
  useEffect(() => {
    const handleEventUpdate = () => {
      loadEvents();
    };

    window.addEventListener('events-updated', handleEventUpdate);
    return () => window.removeEventListener('events-updated', handleEventUpdate);
  }, []);

  // Filter and sort timeline events
  const timelineEvents = useMemo(() => {
    return events
      .filter(event => event.addToTimeline)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  return {
    events: timelineEvents,
    loading,
    error,
    refetch: loadEvents,
  };
} 