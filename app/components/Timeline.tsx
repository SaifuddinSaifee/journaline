'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTimeOutline, IoCalendarOutline, IoRefreshOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { useTimelineEvents } from '../lib/hooks';
import { Event } from '../lib/types';
import { eventService } from '../lib/eventService';
import GlassCard from './GlassCard';
import TimelineCard from './TimelineCard';
import DateRangeSelector, { DateRange } from './DateRangeSelector';

interface DragState {
  isDragging: boolean;
  eventId: string | null;
  startY: number;
  startScrollY: number;
  startCustomY: number;
  currentY: number;
}

const DEFAULT_CARD_SPACING = 250; // Default spacing between cards
const MIN_CARD_SPACING = 200; // Minimum spacing to prevent overlap
const POSITION_STORAGE_KEY = 'timeline-positions';

export function Timeline() {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const { events, loading, error } = useTimelineEvents({ dateRange });
  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);
  
  // Position management
  const [eventPositions, setEventPositions] = useState<Record<string, number>>({});
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    eventId: null,
    startY: 0,
    startScrollY: 0,
    startCustomY: 0,
    currentY: 0
  });
  const [isResetting, setIsResetting] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load positions from localStorage on mount
  useEffect(() => {
    const savedPositions = localStorage.getItem(POSITION_STORAGE_KEY);
    if (savedPositions) {
      try {
        setEventPositions(JSON.parse(savedPositions));
      } catch (err) {
        console.error('Error loading timeline positions:', err);
      }
    }
  }, []);

  // Save positions to localStorage when they change
  useEffect(() => {
    if (Object.keys(eventPositions).length > 0) {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(eventPositions));
    }
  }, [eventPositions]);

  // Keep local state in sync with hook
  useEffect(() => {
    setTimelineEvents(events);
  }, [events]);

  // Calculate default positions for events that don't have custom positions
  const getEventPosition = useCallback((eventId: string, index: number) => {
    if (eventPositions[eventId] !== undefined) {
      return eventPositions[eventId];
    }
    // Default spacing: Use consistent spacing for better layout
    return index * DEFAULT_CARD_SPACING + 100; // Start with some top padding
  }, [eventPositions]);

  // Enhanced collision detection that considers actual visual positioning and card dimensions
  const checkCollisions = useCallback((eventId: string, newY: number, eventList: Event[]) => {
    const currentEventIndex = eventList.findIndex(e => e.id === eventId);
    if (currentEventIndex === -1) return newY;

    const currentEvent = eventList[currentEventIndex];
    const currentEventDate = new Date(currentEvent.date).getTime();
    
    let adjustedY = Math.max(50, newY); // Ensure minimum top position
    
    // Create a list of all other events with their positions
    const otherEvents = eventList
      .map((event, index) => ({
        event,
        index,
        y: getEventPosition(event.id, index),
        date: new Date(event.date).getTime()
      }))
      .filter(item => item.event.id !== eventId);
    
    // Sort events by their current Y position to determine visual order
    otherEvents.sort((a, b) => a.y - b.y);
    
    // Determine visual sides based on current positions
    const getVisualSide = (itemY: number, visualIndex: number) => {
      // Determine left/right based on the alternating pattern from current visual order
      return visualIndex % 2 === 0 ? 'left' : 'right';
    };
    
    // Find where the current event would fit in the visual order
    let currentVisualIndex = 0;
    for (let i = 0; i < otherEvents.length; i++) {
      if (adjustedY > otherEvents[i].y) {
        currentVisualIndex = i + 1;
      } else {
        break;
      }
    }
    
    const currentVisualSide = getVisualSide(adjustedY, currentVisualIndex);
    
    // Check for collisions with each other event
    for (let i = 0; i < otherEvents.length; i++) {
      const otherItem = otherEvents[i];
      const otherVisualIndex = otherEvents.findIndex(item => item === otherItem);
      const otherVisualSide = getVisualSide(otherItem.y, otherEvents.indexOf(otherItem));
      
      const distance = Math.abs(adjustedY - otherItem.y);
      
      // Different collision rules based on relationship between events
      const sameDate = currentEventDate === otherItem.date;
      const sameSide = currentVisualSide === otherVisualSide;
      
      let minDistance = 0;
      
      if (sameDate) {
        // Same date events: minimal spacing regardless of side
        minDistance = 80; // Reduced spacing for same-date events
      } else if (sameSide) {
        // Different dates, same side: larger spacing to prevent card overlap
        minDistance = 180; // Ensure cards don't visually overlap
      } else {
        // Different dates, different sides: minimal spacing since cards won't overlap horizontally
        minDistance = 120; // Small spacing to prevent pills from being too close
      }
      
      // Apply collision adjustment if too close
      if (distance < minDistance) {
        if (adjustedY > otherItem.y) {
          adjustedY = otherItem.y + minDistance;
        } else {
          adjustedY = otherItem.y - minDistance;
          adjustedY = Math.max(50, adjustedY); // Ensure minimum top position
        }
      }
    }

    return adjustedY;
  }, [getEventPosition]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentY = getEventPosition(eventId, timelineEvents.findIndex(ev => ev.id === eventId));
    
    setDragState({
      isDragging: true,
      eventId,
      startY: e.clientY,
      startScrollY: window.scrollY,
      startCustomY: currentY,
      currentY: currentY
    });
  }, [getEventPosition, timelineEvents]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.eventId) return;

    const scrollDelta = window.scrollY - dragState.startScrollY;
    const deltaY = e.clientY - dragState.startY + scrollDelta;
    const newY = dragState.startCustomY + deltaY;
    const adjustedY = checkCollisions(dragState.eventId, newY, timelineEvents);
    
    setDragState(prev => ({ ...prev, currentY: adjustedY }));
    setEventPositions(prev => ({
      ...prev,
      [dragState.eventId!]: adjustedY
    }));
  }, [dragState, checkCollisions, timelineEvents]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      eventId: null,
      startY: 0,
      startScrollY: 0,
      startCustomY: 0,
      currentY: 0
    });
  }, []);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const currentY = getEventPosition(eventId, timelineEvents.findIndex(ev => ev.id === eventId));
    
    setDragState({
      isDragging: true,
      eventId,
      startY: touch.clientY,
      startScrollY: window.scrollY,
      startCustomY: currentY,
      currentY: currentY
    });
  }, [getEventPosition, timelineEvents]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging || !dragState.eventId) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const scrollDelta = window.scrollY - dragState.startScrollY;
    const deltaY = touch.clientY - dragState.startY + scrollDelta;
    const newY = dragState.startCustomY + deltaY;
    const adjustedY = checkCollisions(dragState.eventId, newY, timelineEvents);
    
    setDragState(prev => ({ ...prev, currentY: adjustedY }));
    setEventPositions(prev => ({
      ...prev,
      [dragState.eventId!]: adjustedY
    }));
  }, [dragState, checkCollisions, timelineEvents]);

  const handleTouchEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      eventId: null,
      startY: 0,
      startScrollY: 0,
      startCustomY: 0,
      currentY: 0
    });
  }, []);

  // Add global event listeners for drag operations
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
        
        // Remove position data for deleted event
        setEventPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[eventId];
          return newPositions;
        });
        
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

  const handleResetPositions = useCallback(() => {
    setIsResetting(true);
    
    // Brief delay for visual feedback
    setTimeout(() => {
      // Clear all custom positions
      setEventPositions({});
      
      // Clear localStorage
      localStorage.removeItem(POSITION_STORAGE_KEY);
      
      // Reset drag state if currently dragging
      setDragState({
        isDragging: false,
        eventId: null,
        startY: 0,
        startScrollY: 0,
        startCustomY: 0,
        currentY: 0
      });
      
      setIsResetting(false);
      console.log('Timeline positions reset to default chronological order');
    }, 150);
  }, []);

  // Calculate timeline height dynamically
  const timelineHeight = Math.max(
    600, // Minimum height
    timelineEvents.length > 0 
      ? Math.max(...timelineEvents.map((_, index) => getEventPosition(timelineEvents[index].id, index))) + 300
      : 600
  );

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
              Your chronological journey through events marked for timeline display. Drag date pills to reposition events.
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
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetPositions}
                  disabled={isResetting || Object.keys(eventPositions).length === 0}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200
                    ${isResetting || Object.keys(eventPositions).length === 0
                      ? 'text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-700/50 border-gray-200/30 dark:border-gray-600/30 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:shadow-md cursor-pointer'
                    }
                    rounded-lg border
                  `}
                  title={Object.keys(eventPositions).length === 0 ? "No custom positions to reset" : "Reset all pill positions to default chronological order"}
                >
                  <IoRefreshOutline className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                  {isResetting ? 'Resetting...' : 'Reset Positions'}
                </button>
                <DateRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>
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
              <div 
                ref={timelineRef} 
                className="relative" 
                style={{ minHeight: `${timelineHeight}px` }}
              >
                {/* Center Timeline Line - Hidden on mobile, visible on desktop */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                {/* Mobile Timeline Line - Visible on mobile only */}
                <div className="md:hidden absolute left-4 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                {/* Timeline Events */}
                <div className="relative">
                  {timelineEvents.map((event, index) => {
                    const isEven = index % 2 === 0;
                    const eventDate = new Date(event.date);
                    const eventY = getEventPosition(event.id, index);
                    const isDraggingThis = dragState.isDragging && dragState.eventId === event.id;
                    const displayY = isDraggingThis ? dragState.currentY : eventY;
                    
                    return (
                      <div 
                        key={event.id} 
                        className="absolute w-full transition-all duration-150"
                        style={{ 
                          top: `${displayY}px`,
                          transition: isDraggingThis ? 'none' : 'top 0.15s ease-out'
                        }}
                      >
                        {/* Center Date Marker - Desktop */}
                        <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          {/* Date Label */}
                          <div 
                            className={`
                              bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700
                              cursor-grab active:cursor-grabbing select-none
                              transition-all duration-200
                              ${isDraggingThis 
                                ? 'scale-110 shadow-lg ring-2 ring-blue-500/50 cursor-grabbing' 
                                : 'hover:shadow-lg hover:scale-105'
                              }
                            `}
                            onMouseDown={(e) => handleMouseDown(e, event.id)}
                            onTouchStart={(e) => handleTouchStart(e, event.id)}
                            title="Drag to reposition"
                          >
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
                              {format(eventDate, 'MMM d')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mobile Date Indicator */}
                        <div className="md:hidden absolute left-2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          <div 
                            className={`
                              bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700
                              cursor-grab active:cursor-grabbing select-none
                              transition-all duration-200
                              ${isDraggingThis 
                                ? 'scale-110 shadow-lg ring-2 ring-blue-500/50 cursor-grabbing' 
                                : 'hover:shadow-lg hover:scale-105'
                              }
                            `}
                            onMouseDown={(e) => handleMouseDown(e, event.id)}
                            onTouchStart={(e) => handleTouchStart(e, event.id)}
                            title="Drag to reposition"
                          >
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
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
                                ${isDraggingThis ? 'ring-2 ring-blue-500/30' : ''}
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