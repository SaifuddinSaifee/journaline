'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import GlassCard from './GlassCard';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { Event, EventFormData } from '../lib/types';

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('journaline-events');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error parsing saved events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('journaline-events', JSON.stringify(events));
  }, [events]);

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

  const handleSaveEvent = (eventData: EventFormData) => {
    if (!selectedDate) return;

    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: eventData.title,
      description: eventData.description,
      date: selectedDate.toISOString(),
      addToTimeline: eventData.addToTimeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents(prev => [...prev, newEvent]);
  };

  const handleEditEvent = (updatedEvent: Event) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
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
      <GlassCard variant="default" className="min-h-96">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Events
            </h2>
            <p className="text-text-secondary">
              Your journal entries and events. Select a date from the calendar to add new entries.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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