'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import GlassCard from './GlassCard';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { Event, EventFormData, Timeline } from '../lib/types';
import { eventService } from '../lib/eventService';
import { timelineService } from '../lib/timelineService';
import { IoCalendarOutline } from 'react-icons/io5';
import Toast from './Toast';

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allTimelines, setAllTimelines] = useState<Timeline[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view'); // Add modal mode state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  // Memoize the timeline associations for better performance
  const getAssociatedTimelines = useCallback((eventTimelineIds: string[]) => {
    return allTimelines.filter(t => eventTimelineIds.includes(t.id));
  }, [allTimelines]);

  // Load events and timelines from API on mount
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
        console.error('Failed to load timelines:', timelineResult.error);
        setAllTimelines([]);
      } else if (timelineResult.data) {
        // Exclude archived timelines
        setAllTimelines(timelineResult.data.filter(t => !t.isArchived));
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
      setModalMode('edit'); // New events should open in edit mode
      setIsModalOpen(true);
    };

    window.addEventListener('calendar-date-selected', handleDateSelect as EventListener);
    return () => {
      window.removeEventListener('calendar-date-selected', handleDateSelect as EventListener);
    };
  }, []);

  const handleSaveEvent = async (eventData: EventFormData, eventId?: string) => {
    try {
      if (eventId) {
        // Update existing event
        const result = await eventService.updateEvent(eventId, {
          ...eventData,
          date: selectedEvent!.date, // Keep the existing date
        });

        if (result.error) {
          setError(result.error);
          setToastMessage("Failed to update event");
          setToastVariant("error");
          setShowToast(true);
        } else if (result.data) {
          setEvents(prev => prev.map(event => 
            event.id === eventId ? result.data! : event
          ));
          
          // Dispatch custom event to notify timeline hook of updates
          const event = new CustomEvent('events-updated');
          window.dispatchEvent(event);

          setToastMessage("Event updated successfully!");
          setToastVariant("success");
          setShowToast(true);
        }
      } else if (selectedDate) {
        // Create new event
        const result = await eventService.createEvent({
          ...eventData,
          date: selectedDate.toISOString(),
        });

        if (result.error) {
          setError(result.error);
          setToastMessage("Failed to create event");
          setToastVariant("error");
          setShowToast(true);
        } else if (result.data) {
          setEvents(prev => [result.data!, ...prev]);
          
          // Dispatch custom event to notify timeline hook of updates
          const event = new CustomEvent('events-updated');
          window.dispatchEvent(event);

          setToastMessage("Event created successfully!");
          setToastVariant("success");
          setShowToast(true);
        }
      }
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event');
      setToastMessage("Failed to save event");
      setToastVariant("error");
      setShowToast(true);
    }

    handleCloseModal();
  };

  const handleEditEvent = async (updatedEvent: Event) => {
    try {
      const result = await eventService.updateEvent(updatedEvent.id, {
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.date,
        timelineIds: updatedEvent.timelineIds,
      });

      if (result.error) {
        setError(result.error);
        setToastMessage("Failed to update event");
        setToastVariant("error");
        setShowToast(true);
      } else if (result.data) {
        setEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? result.data! : event
        ));
        
        // Dispatch custom event to notify timeline hook of updates
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);

        setToastMessage("Event updated successfully!");
        setToastVariant("success");
        setShowToast(true);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      setToastMessage("Failed to update event");
      setToastVariant("error");
      setShowToast(true);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const result = await eventService.deleteEvent(eventId);

      if (result.error) {
        setError(result.error);
        setToastMessage("Failed to delete event");
        setToastVariant("error");
        setShowToast(true);
      } else {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Dispatch custom event to notify timeline hook of updates
        const event = new CustomEvent('events-updated');
        window.dispatchEvent(event);

        setToastMessage("Event deleted successfully!");
        setToastVariant("success");
        setShowToast(true);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      setToastMessage("Failed to delete event");
      setToastVariant("error");
      setShowToast(true);
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setModalMode('view'); // Open in view mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setModalMode('edit'); // Open directly in edit mode
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEvent(undefined);
    setModalMode('view'); // Reset to default
  };

  // Group events by month-year
  const groupedEvents = events.reduce((acc, event) => {
    // Parse date consistently to avoid timezone issues
    const eventDate = new Date(event.date);
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth(); // Keep 0-indexed for proper Date construction
    const monthYearKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    if (!acc[monthYearKey]) {
      acc[monthYearKey] = [];
    }
    acc[monthYearKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort months in descending order (most recent first)
  const sortedMonths = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  // Sort events within each month in reverse chronological order (newest first)
  sortedMonths.forEach(monthKey => {
    groupedEvents[monthKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  return (
    <div className="max-w-6xl mx-auto">
      <GlassCard padding='none' variant="default" hover={false} className="min-h-96">
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
            <div className="space-y-8">
              {sortedMonths.map(monthKey => (
                <div key={monthKey}>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-text-primary border-b border-gray-200/30 dark:border-gray-700/30 pb-3">
                      {(() => {
                        // Parse monthKey safely without timezone issues
                        const [yearStr, monthStr] = monthKey.split('-');
                        const year = parseInt(yearStr, 10);
                        const month = parseInt(monthStr, 10) - 1; // Convert to 0-indexed for Date constructor
                        const displayDate = new Date(year, month, 1); // Explicit local date construction
                        return format(displayDate, 'MMMM yyyy');
                      })()}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedEvents[monthKey].map(event => {
                      const associatedTimelines = getAssociatedTimelines(event.timelineIds || []);
                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          onEdit={handleEditEvent}
                          onDelete={handleDeleteEvent}
                          onView={handleViewEvent}
                          onEditModal={handleOpenEditModal}
                          allTimelines={allTimelines}
                          associatedTimelines={associatedTimelines}
                        />
                      );
                    })}
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
        event={selectedEvent}
        allTimelines={allTimelines}
        associatedTimelines={selectedEvent ? getAssociatedTimelines(selectedEvent.timelineIds || []) : []}
        onDelete={handleDeleteEvent}
        initialMode={modalMode}
      />

      <Toast
        message={toastMessage}
        variant={toastVariant}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}

export default Events; 