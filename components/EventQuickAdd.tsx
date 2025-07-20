'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Event } from '../lib/types';
import { eventService } from '../lib/eventService';
import { IoCalendarOutline, IoAdd, IoCheckmark } from 'react-icons/io5';
import { format } from 'date-fns';
import { motion, PanInfo, animate } from 'framer-motion';
import GlassButton from './GlassButton';
import { useDrag } from './DragContext';

interface EventQuickAddProps {
  isCollapsed: boolean;
  timelineId: string;
  onEventAdded?: () => void;
}

export function EventQuickAdd({ isCollapsed, timelineId, onEventAdded }: EventQuickAddProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingEventIds, setAddingEventIds] = useState<Set<string>>(new Set());
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  
  const { startDrag, endDrag, dragState, setHoveringDropZone } = useDrag();

  const loadEvents = useCallback(async () => {
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
  }, [timelineId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Listen for events updates
  useEffect(() => {
    const handleEventUpdate = () => {
      console.log('EventQuickAdd: Received events-updated event, refreshing event list...');
      loadEvents();
    };

    window.addEventListener('events-updated', handleEventUpdate);
    return () => window.removeEventListener('events-updated', handleEventUpdate);
  }, [loadEvents]);

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

  const handleDragStart = (event: Event, element: HTMLElement) => {
    setDraggedEventId(event.id);
    
    // Get the element's position relative to the viewport
    const rect = element.getBoundingClientRect();
    const startPosition = { x: rect.left, y: rect.top };
    
    // Store start position for this specific event
    setDragStartPositions(prev => new Map(prev).set(event.id, startPosition));
    
    startDrag(event, 'sidebar', startPosition);
  };

  const handleDrag = (event: Event, info: PanInfo) => {
    // Check if we're hovering over the timeline drop zone
    const timeline = document.querySelector('[data-timeline-drop-zone]');
    if (timeline) {
      const timelineRect = timeline.getBoundingClientRect();
      const dragX = info.point.x;
      const dragY = info.point.y;
      
      const isOverTimeline = (
        dragX >= timelineRect.left &&
        dragX <= timelineRect.right &&
        dragY >= timelineRect.top &&
        dragY <= timelineRect.bottom
      );
      
      setHoveringDropZone(isOverTimeline);
    }
  };

  const handleDragEnd = async (event: Event, info: PanInfo, element: HTMLElement) => {
    setDraggedEventId(null);
    
    // Check if drag ended over timeline area
    const timeline = document.querySelector('[data-timeline-drop-zone]');
    let droppedOnTimeline = false;
    
    if (timeline) {
      const timelineRect = timeline.getBoundingClientRect();
      const dragX = info.point.x;
      const dragY = info.point.y;
      
      droppedOnTimeline = (
        dragX >= timelineRect.left &&
        dragX <= timelineRect.right &&
        dragY >= timelineRect.top &&
        dragY <= timelineRect.bottom
      );
    }
    
    if (droppedOnTimeline) {
      // Successfully dropped on timeline - add the event
      await handleAddEvent(event);
    } else {
      // Not dropped on timeline - animate back to original position
      const startPos = dragStartPositions.get(event.id);
      if (startPos && element) {
        const currentRect = element.getBoundingClientRect();
        const deltaX = startPos.x - currentRect.left;
        const deltaY = startPos.y - currentRect.top;
        
        // Animate back to original position
        await animate(element, {
          x: deltaX,
          y: deltaY,
        }, {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        });
        
        // Reset position after animation
        await animate(element, {
          x: 0,
          y: 0,
        }, {
          duration: 0,
        });
      }
    }
    
    // Clear hover state and end drag
    setHoveringDropZone(false);
    endDrag();
    
    // Clean up start position
    setDragStartPositions(prev => {
      const newMap = new Map(prev);
      newMap.delete(event.id);
      return newMap;
    });
  };

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <div className="w-full h-10 flex items-center justify-center">
          <IoCalendarOutline className="w-5 h-5 text-text-secondary" title="Available Events" />
        </div>
        {!loading && events.slice(0, 2).map((event) => (
          <motion.div
            key={event.id}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragStart={(_, info) => {
              const element = info.point.x ? document.elementFromPoint(info.point.x, info.point.y)?.closest('[data-event-card]') as HTMLElement : null;
              if (element) handleDragStart(event, element);
            }}
            onDrag={(_, info) => handleDrag(event, info)}
            onDragEnd={(_, info) => {
              const element = info.point.x ? document.elementFromPoint(info.point.x, info.point.y)?.closest('[data-event-card]') as HTMLElement : null;
              if (element) handleDragEnd(event, info, element);
            }}
            whileDrag={{ 
              scale: 1.1, 
              rotate: 5,
              zIndex: 50,
              opacity: 0.8,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            animate={{
              opacity: draggedEventId === event.id ? 0.3 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="cursor-grab active:cursor-grabbing"
            data-event-card
          >
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => handleAddEvent(event)}
              disabled={addingEventIds.has(event.id) || draggedEventId === event.id}
              className="w-full h-10 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50"
              title={`Add "${event.title}" to timeline or drag to timeline`}
            >
              {addingEventIds.has(event.id) ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
              ) : (
                <IoAdd className="w-4 h-4" />
              )}
            </GlassButton>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center gap-2">
        <IoCalendarOutline className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-medium text-text-primary">Add Events</h3>
        {dragState.isDragging && (
          <span className="text-xs text-blue-500 animate-pulse">
            Drag to timeline →
          </span>
        )}
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
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const isAdding = addingEventIds.has(event.id);
            const isDragging = draggedEventId === event.id;
            
            return (
              <motion.div
                key={event.id}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragStart={(_, info) => {
                  const element = info.point.x ? document.elementFromPoint(info.point.x, info.point.y)?.closest('[data-event-card]') as HTMLElement : null;
                  if (element) handleDragStart(event, element);
                }}
                onDrag={(_, info) => handleDrag(event, info)}
                onDragEnd={(_, info) => {
                  const element = info.point.x ? document.elementFromPoint(info.point.x, info.point.y)?.closest('[data-event-card]') as HTMLElement : null;
                  if (element) handleDragEnd(event, info, element);
                }}
                whileDrag={{ 
                  scale: 1.05, 
                  rotate: 3,
                  zIndex: 50,
                  opacity: 0.9,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                animate={{
                  opacity: isDragging ? 0.3 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 shadow-sm hover:shadow-md transition-all duration-200 group backdrop-blur-sm hover:bg-gray-50/80 dark:hover:bg-gray-700/60 ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                data-event-card
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddEvent(event);
                    }}
                    disabled={isAdding || isDragging}
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventQuickAdd; 