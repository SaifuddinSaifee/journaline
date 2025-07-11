'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import GlassCard from './GlassCard';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { Event, EventFormData, Timeline } from '../lib/types';
import { eventService } from '../lib/eventService';
import { timelineService } from '../lib/timelineService';
import { IoCalendarOutline } from 'react-icons/io5';

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allTimelines, setAllTimelines] = useState<Timeline[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  // Load events from API on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for localStorage data and migrate if needed
      const localEvents = eventService.getEventsFromLocalStorage();
      if (localEvents.length > 0) {
        setMigrating(true);
        const migrationResult = await eventService.migrateFromLocalStorage();
        setMigrating(false);
        
        if (migrationResult.error) {
          console.error('Migration error:', migrationResult.error);
        } else if (migrationResult.data) {
          console.log(`Migration completed: ${migrationResult.data.migrated} events migrated, ${migrationResult.data.failed} failed`);
        }
      }

      // Load events from API
      const eventResult = await eventService.getAllEvents();
      if (eventResult.error) {
        setError(eventResult.error);
        setEvents([]);
      } else if (eventResult.data) {
        setEvents(eventResult.data);
      }

      // Load all timelines
      const timelineResult = await timelineService.getAllTimelines();
      if (timelineResult.error) {
        // Non-critical, so we can just log it and continue
        console.error('Failed to load timelines:', timelineResult.error);
        setAllTimelines([]);
      } else if (timelineResult.data) {
        setAllTimelines(timelineResult.data);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load events or timelines');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Listen for calendar date selection
  useEffect(() => {
    const handleDateSelect = (event: CustomEvent) => {
      setSelectedDate(event.detail.date);
      setIsModalOpen(true);
    };

    window.addEventListener('calendar-date-selected', handleDateSelect as EventListener);
    return () => {
      window.removeEventListener('calendar-date-selected', handleDateSelect as EventListener);
    };
  }, []);

  const handleSaveEvent = async (eventData: EventFormData) => {
    if (!selectedDate) return;

    try {
      const result = await eventService.createEvent({
        ...eventData,
        date: selectedDate.toISOString(),
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setEvents(prev => [result.data!, ...prev]);
        
        // Dispatch custom event to notify timeline hook of updates
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
    }
  };

  const handleEditEvent = async (updatedEvent: Event) => {
    try {
      const result = await eventService.updateEvent(updatedEvent.id, {
        title: updatedEvent.title,
        description: updatedEvent.description,
        timelineIds: updatedEvent.timelineIds,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? result.data! : event
        ));
        
        // Dispatch custom event to notify timeline hook of updates
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const result = await eventService.deleteEvent(eventId);

      if (result.error) {
        setError(result.error);
      } else {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Dispatch custom event to notify timeline hook of updates
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-6xl mx-auto">
      <GlassCard variant="default" hover={false} className="min-h-96">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Events
            </h2>
            <p className="text-text-secondary">
              Your journal entries and events. Select a date from the calendar to add new entries.
            </p>
          </div>

          {loading || migrating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {migrating ? 'Migrating your data...' : 'Loading events...'}
              </h3>
              <p className="text-text-secondary">
                {migrating ? 'Moving your events to the cloud.' : 'Please wait while we fetch your events.'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <IoCalendarOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">
                Error loading events
              </h3>
              <p className="text-text-secondary mb-4">
                {error}
              </p>
              <button
                onClick={loadEvents}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <IoCalendarOutline className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No events yet
              </h3>
              <p className="text-text-secondary">
                Select a date from the calendar to create your first journal entry.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-text-primary border-b border-gray-200/30 dark:border-gray-700/30 pb-2">
                      {format(new Date(dateKey), 'MMMM d, yyyy')}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedEvents[dateKey].map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        allTimelines={allTimelines}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default Events; 