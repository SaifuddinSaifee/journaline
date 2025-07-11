"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTimelineEvents } from "../lib/hooks";
import { Event } from "../lib/types";
import { eventService } from "../lib/eventService";
import GlassCard from "./GlassCard";
import TimelineCard from "./TimelineCard";
import DateRangeSelector, { DateRange } from "./DateRangeSelector";

interface DragState {
  isDragging: boolean;
  groupId: string | null;
  startY: number;
  startScrollY: number;
  startCustomY: number;
  currentY: number;
}

const DEFAULT_GROUP_SPACING = 500; // Default spacing between date groups
const VERTICAL_PADDING = 50; // Vertical padding between groups
const GROUP_POSITION_STORAGE_KEY = "timeline-group-positions";
const GROUP_ORDER_STORAGE_KEY = "timeline-group-order";

export function Timeline() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const { events, loading, error } = useTimelineEvents({ dateRange });
  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);
  
  // State for visual order and positions of groups
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [groupPositions, setGroupPositions] = useState<Record<string, number>>(
    {}
  );
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    groupId: null,
    startY: 0,
    startScrollY: 0,
    startCustomY: 0,
    currentY: 0,
  });
  const [isResetting, setIsResetting] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Group events by date, creating a map
  const groupsByDate = useMemo(() => {
    if (!timelineEvents) return new Map();
    
    const groups: Record<string, Event[]> = timelineEvents.reduce(
      (acc, event) => {
        const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
        if (!acc[eventDate]) {
          acc[eventDate] = [];
        }
        acc[eventDate].push(event);
        return acc;
      },
      {} as Record<string, Event[]>
    );

    return new Map(Object.entries(groups).map(([date, events]) => [date, events]));
  }, [timelineEvents]);

  // Create the ordered array of groups for rendering
  const orderedGroups = useMemo(() => {
    return groupOrder
      .map(date => {
        const events = groupsByDate.get(date);
        if (!events) return null;
        return { date, events };
      })
      .filter(Boolean) as { date: string, events: Event[] }[];
  }, [groupOrder, groupsByDate]);

  // Load positions and order from localStorage on mount
  useEffect(() => {
    const savedPositions = localStorage.getItem(GROUP_POSITION_STORAGE_KEY);
    const savedOrder = localStorage.getItem(GROUP_ORDER_STORAGE_KEY);
    
    if (savedPositions) {
      try {
        setGroupPositions(JSON.parse(savedPositions));
      } catch (err) {
        console.error('Error loading timeline group positions:', err);
      }
    }
    if (savedOrder) {
      try {
        setGroupOrder(JSON.parse(savedOrder));
      } catch (err) {
        console.error('Error loading timeline group order:', err);
      }
    }
  }, []);

  // Save positions and order to localStorage when they change
  useEffect(() => {
    if (Object.keys(groupPositions).length > 0) {
      localStorage.setItem(
        GROUP_POSITION_STORAGE_KEY,
        JSON.stringify(groupPositions)
      );
    }
    if (groupOrder.length > 0) {
      localStorage.setItem(GROUP_ORDER_STORAGE_KEY, JSON.stringify(groupOrder));
    }
  }, [groupPositions, groupOrder]);
  
  // Sync local state with hook and initialize order
  useEffect(() => {
    setTimelineEvents(events);
    
    // Initialize order if not already loaded from storage or if events changed
    const newChronologicalOrder = Array.from(groupsByDate.keys())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const currentOrderSet = new Set(groupOrder);
    const newOrderSet = new Set(newChronologicalOrder);

    if (groupOrder.length === 0 || currentOrderSet.size !== newOrderSet.size) {
       setGroupOrder(newChronologicalOrder);
    }
  }, [events, groupsByDate]);

  // Calculate default positions for groups that don't have one
  const getGroupPosition = useCallback((date: string, index: number) => {
    if (groupPositions[date] !== undefined) {
      return groupPositions[date];
    }
    // This fallback will be used for newly added groups
    let calculatedY = 100;
    for (let i = 0; i < index; i++) {
        const prevGroupDate = groupOrder[i];
        const prevGroupHeight = groupRefs.current[prevGroupDate]?.offsetHeight || DEFAULT_GROUP_SPACING;
        calculatedY += prevGroupHeight + VERTICAL_PADDING;
    }
    return calculatedY;
  }, [groupPositions, groupOrder]);

  // Mouse event handlers for dragging groups
  const handleMouseDown = useCallback((e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const groupIndex = orderedGroups.findIndex(g => g.date === groupId);
    const currentY = getGroupPosition(groupId, groupIndex);
    setDragState({
      isDragging: true,
      groupId,
      startY: e.clientY,
      startScrollY: window.scrollY,
      startCustomY: currentY,
      currentY: currentY,
    });
  }, [getGroupPosition, orderedGroups]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.groupId) return;
    const deltaY = e.clientY - dragState.startY;
    const newY = dragState.startCustomY + deltaY;
    setDragState(prev => ({ ...prev, currentY: newY }));
    setGroupPositions(prev => ({ ...prev, [dragState.groupId!]: newY }));
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    if (!dragState.groupId) return;

    // Create a list of groups with their final positions
    const finalLayout = groupOrder.map(date => ({
      date,
      y: groupPositions[date] || 0
    })).sort((a, b) => a.y - b.y);

    const newOrder = finalLayout.map(g => g.date);

    // Recalculate all positions based on the new order to "settle" them
    const newPositions: Record<string, number> = {};
    let currentY = 100;
    newOrder.forEach(date => {
      newPositions[date] = currentY;
      const groupHeight = groupRefs.current[date]?.offsetHeight || DEFAULT_GROUP_SPACING;
      currentY += groupHeight + VERTICAL_PADDING;
    });

    setGroupOrder(newOrder);
    setGroupPositions(newPositions);
    
    setDragState({ isDragging: false, groupId: null, startY: 0, startScrollY: 0, startCustomY: 0, currentY: 0 });
  }, [dragState.groupId, groupOrder, groupPositions]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    const groupIndex = orderedGroups.findIndex(g => g.date === groupId);
    const currentY = getGroupPosition(groupId, groupIndex);
    setDragState({
      isDragging: true,
      groupId,
      startY: touch.clientY,
      startScrollY: window.scrollY,
      startCustomY: currentY,
      currentY: currentY,
    });
  }, [getGroupPosition, orderedGroups]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging || !dragState.groupId) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragState.startY;
    const newY = dragState.startCustomY + deltaY;
    setDragState(prev => ({ ...prev, currentY: newY }));
    setGroupPositions(prev => ({ ...prev, [dragState.groupId!]: newY }));
  }, [dragState]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp(); // Reuse the same logic
  }, [handleMouseUp]);

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
        setTimelineEvents(prev =>
          prev.map(event =>
            event.id === updatedEvent.id ? result.data! : event
          )
        );
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
        setTimelineEvents(prev =>
          prev.filter(event => event.id !== eventId)
        );
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
    setTimeout(() => {
      // Clear stored positions and order
      setGroupPositions({});
      localStorage.removeItem(GROUP_POSITION_STORAGE_KEY);
      localStorage.removeItem(GROUP_ORDER_STORAGE_KEY);

      // Reset order to chronological
      const chronologicalOrder = Array.from(groupsByDate.keys())
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      setGroupOrder(chronologicalOrder);
      
      setDragState({ isDragging: false, groupId: null, startY: 0, startScrollY: 0, startCustomY: 0, currentY: 0 });
      setIsResetting(false);
      console.log('Timeline positions and order reset to default');
    }, 150);
  }, [groupsByDate]);

  const timelineHeight = Math.max(
    600,
    orderedGroups.length > 0
      ? Math.max(
          ...orderedGroups.map(
            (group, index) =>
              getGroupPosition(group.date, index) +
              (groupRefs.current[group.date]?.offsetHeight || 0)
          )
        ) + 300
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
              <p className="text-red-600 dark:text-red-400 mb-2">
                Error loading timeline
              </p>
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
              Your chronological journey. Drag date pills to re-order event
              groups.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-text-secondary">
                  {timelineEvents.length} event
                  {timelineEvents.length !== 1 ? 's' : ''} across{' '}
                  {orderedGroups.length} day
                  {orderedGroups.length !== 1 ? 's' : ''}
                  {dateRange.startDate && dateRange.endDate
                    ? ' in selected range'
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetPositions}
                  disabled={isResetting}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isResetting
                      ? 'text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-700/50 border-gray-200/30 dark:border-gray-600/30 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:shadow-md cursor-pointer'
                  } rounded-lg border`}
                  title={'Reset all pill positions and order to default'}
                >
                  <IoRefreshOutline
                    className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`}
                  />
                  {isResetting ? 'Resetting...' : 'Reset Layout'}
                </button>
                <DateRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>
            </div>
          </div>

          {orderedGroups.length === 0 ? (
            <div className="text-center py-12">
              <IoCalendarOutline className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {dateRange.startDate && dateRange.endDate
                  ? 'No events in selected range'
                  : 'No timeline events yet'}
              </h3>
              <p className="text-text-secondary mb-4">
                {dateRange.startDate && dateRange.endDate
                  ? 'Try adjusting your date range or create new events in this period.'
                  : 'Create journal entries and mark them with "Add to timeline" to see them here.'}
              </p>
              <p className="text-text-muted text-sm">
                Your timeline will display events chronologically by default.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                ref={timelineRef}
                className="relative"
                style={{ minHeight: `${timelineHeight}px` }}
              >
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                <div className="md:hidden absolute left-4 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                <div className="relative">
                  {orderedGroups.map((group, index) => {
                    const isEven = index % 2 === 0;
                    const groupDate = new Date(group.date);
                    const groupY = getGroupPosition(group.date, index);
                    const isDraggingThis =
                      dragState.isDragging && dragState.groupId === group.date;
                    const displayY = isDraggingThis
                      ? dragState.currentY
                      : groupY;
                    
                    return (
                      <motion.div
                        key={group.date}
                        ref={el => {
                          groupRefs.current[group.date] = el;
                        }}
                        layout
                        className="absolute w-full"
                        style={{
                          top: `${displayY}px`,
                          zIndex: isDraggingThis ? 30 : 10,
                        }}
                        transition={isDraggingThis ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 40 }}
                      >
                        <div className="hidden md:block absolute left-1/2 top-4 transform -translate-x-1/2 z-20">
                          <div
                            className={`bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
                              isDraggingThis
                                ? 'scale-110 shadow-lg ring-2 ring-blue-500/50 cursor-grabbing'
                                : 'hover:shadow-lg hover:scale-105'
                            }`}
                            onMouseDown={e => handleMouseDown(e, group.date)}
                            onTouchStart={e =>
                              handleTouchStart(e, group.date)
                            }
                            title="Drag to re-order date group"
                          >
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
                              {format(groupDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>

                        <div className="md:hidden absolute left-2 top-4 transform -translate-x-1/2 z-20">
                          <div
                            className={`bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
                              isDraggingThis
                                ? 'scale-110 shadow-lg ring-2 ring-blue-500/50 cursor-grabbing'
                                : 'hover:shadow-lg hover:scale-105'
                            }`}
                            onMouseDown={e => handleMouseDown(e, group.date)}
                            onTouchStart={e =>
                              handleTouchStart(e, group.date)
                            }
                            title="Drag to re-order date group"
                          >
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
                              {format(groupDate, 'MMM d')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="md:hidden absolute left-8 top-6 transform -translate-y-1/2 w-6 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 z-10" />

                        <div
                          className={`md:flex ${
                            isEven ? 'md:justify-start' : 'md:justify-end'
                          } ml-14 md:ml-0`}
                        >
                          <div
                            className={`w-full md:max-w-md ${
                              isEven ? 'md:pr-8' : 'md:pl-8'
                            } relative`}
                          >
                            <div
                              className={`hidden md:block absolute top-[34px] transform -translate-y-1/2 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 z-10 ${
                                isEven ? 'left-full w-8' : 'right-full w-8'
                              }`}
                            />
                            <div className="space-y-4">
                              {group.events.map(event => (
                                <TimelineCard
                                  key={event.id}
                                  event={event}
                                  onEdit={handleEditEvent}
                                  onDelete={handleDeleteEvent}
                                  className={`transform transition-all duration-300 hover:scale-[1.02] ${
                                    isEven
                                      ? 'md:hover:translate-x-1'
                                      : 'md:hover:-translate-x-1'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
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
