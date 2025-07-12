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
import { Event, Timeline as TimelineType } from "../lib/types";
import { eventService } from "../lib/eventService";
import { timelineService } from '../lib/timelineService';
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

const DEFAULT_GROUP_SPACING = 500;
const VERTICAL_PADDING = 50;

interface TimelineProps {
  timeline: TimelineType;
  mode?: 'view' | 'edit';
}

export function Timeline({ timeline, mode = 'view' }: TimelineProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  
  // Use timelineId from props to fetch events
  const { events, loading, error, refetch } = useTimelineEvents({
    timelineId: timeline.id,
    dateRange,
  });

  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);
  
  // State for visual order and positions of groups, initialized from props
  const [groupOrder, setGroupOrder] = useState<string[]>(timeline.groupOrder || []);
  const [groupPositions, setGroupPositions] = useState<Record<string, number>>(
    timeline.groupPositions || {}
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

  // Group events by date
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
    // Ensure groupOrder only contains dates that are present in groupsByDate
    const validGroupOrder = groupOrder.filter(date => groupsByDate.has(date));
    
    return validGroupOrder
      .map(date => {
        const events = groupsByDate.get(date);
        if (!events) return null;
        return { date, events };
      })
      .filter(Boolean) as { date: string, events: Event[] }[];
  }, [groupOrder, groupsByDate]);

  // Sync with fetched events and initialize order/positions if needed
  useEffect(() => {
    setTimelineEvents(events);

    const chronologicalOrder = Array.from(groupsByDate.keys())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Initialize order if it's empty or doesn't match the current event groups
    if (groupOrder.length === 0 && chronologicalOrder.length > 0) {
      setGroupOrder(chronologicalOrder);
    }
    
    // Initialize positions if empty
    if (Object.keys(groupPositions).length === 0 && chronologicalOrder.length > 0) {
      const newPositions: Record<string, number> = {};
      let currentY = 100;
      chronologicalOrder.forEach(date => {
        newPositions[date] = currentY;
        // Estimate height for initial layout
        const estimatedEventHeight = 150; // A rough guess
        const groupHeight = (groupsByDate.get(date)?.length || 0) * estimatedEventHeight;
        currentY += groupHeight + VERTICAL_PADDING;
      });
      setGroupPositions(newPositions);
    }
  }, [events, groupsByDate, groupOrder.length, groupPositions]);


  // Persist layout changes to the database
  const persistLayout = useCallback(async (order: string[], positions: Record<string, number>) => {
    await timelineService.updateTimeline(timeline.id, {
      groupOrder: order,
      groupPositions: positions,
    });
  }, [timeline.id]);
  
  // Calculate default positions for groups that don't have one
  const getGroupPosition = useCallback((date: string, index: number) => {
    if (groupPositions[date] !== undefined) {
      return groupPositions[date];
    }
    
    let calculatedY = 100;
    if (index > 0) {
      const prevGroupDate = groupOrder[index - 1];
      const prevGroupY = groupPositions[prevGroupDate] || 0;
      const prevGroupHeight = groupRefs.current[prevGroupDate]?.offsetHeight || DEFAULT_GROUP_SPACING;
      calculatedY = prevGroupY + prevGroupHeight + VERTICAL_PADDING;
    }
    return calculatedY;
  }, [groupPositions, groupOrder]);

  // Mouse event handlers for dragging groups
  const handleMouseDown = useCallback((e: React.MouseEvent, groupId: string) => {
    if (mode === 'view') return;
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
  }, [getGroupPosition, orderedGroups, mode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.groupId) return;
    const deltaY = e.clientY - dragState.startY;
    const newY = dragState.startCustomY + deltaY;
    setDragState(prev => ({ ...prev, currentY: newY }));
  }, [dragState]);

  const handleMouseUp = useCallback(async () => {
    if (!dragState.groupId) return;

    const finalPositions = {
      ...groupPositions,
      [dragState.groupId]: dragState.currentY,
    };

    // Create a list of groups with their final positions
    const finalLayout = groupOrder
      .map(date => ({
        date,
        y: finalPositions[date] || 0,
      }))
      .sort((a, b) => a.y - b.y);

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
    
    // Persist the new layout to the database
    await persistLayout(newOrder, newPositions);
    
    setDragState({ isDragging: false, groupId: null, startY: 0, startScrollY: 0, startCustomY: 0, currentY: 0 });
  }, [
    dragState.groupId,
    dragState.currentY,
    groupOrder,
    groupPositions,
    persistLayout,
  ]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent, groupId: string) => {
    if (mode === 'view') return;
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
  }, [getGroupPosition, orderedGroups, mode]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging || !dragState.groupId) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragState.startY;
    const newY = dragState.startCustomY + deltaY;
    setDragState(prev => ({ ...prev, currentY: newY }));
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

  // When an event is edited, we only need to refetch if its timeline association changes.
  // For now, a simple refetch is sufficient.
  const handleEditEvent = async (updatedEvent: Event) => {
    const { id, title, description, timelineIds } = updatedEvent;
    const result = await eventService.updateEvent(id, { title, description, timelineIds });
    if (result.error) {
      console.error('Error updating event:', result.error);
    } else {
      refetch(); // Refetch all events for this timeline
      const event = new CustomEvent('events-updated'); // Notify other components
      window.dispatchEvent(event);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const result = await eventService.deleteEvent(eventId);
    if (result.error) {
      console.error('Error deleting event:', result.error);
    } else {
      refetch(); // Refetch all events for this timeline
      const event = new CustomEvent('events-updated'); // Notify other components
      window.dispatchEvent(event);
    }
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const handleResetPositions = useCallback(async () => {
    setIsResetting(true);
    
    const chronologicalOrder = Array.from(groupsByDate.keys())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const newPositions: Record<string, number> = {};
    let currentY = 100;
    chronologicalOrder.forEach(date => {
      newPositions[date] = currentY;
      const groupHeight = groupRefs.current[date]?.offsetHeight || DEFAULT_GROUP_SPACING;
      currentY += groupHeight + VERTICAL_PADDING;
    });

    setGroupOrder(chronologicalOrder);
    setGroupPositions(newPositions);
    
    // Persist the reset layout to the database
    await persistLayout(chronologicalOrder, newPositions);
    
    setDragState({ isDragging: false, groupId: null, startY: 0, startScrollY: 0, startCustomY: 0, currentY: 0 });
    setIsResetting(false);
    console.log('Timeline positions and order reset to default');
  }, [groupsByDate, persistLayout]);

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
              {timeline.name}
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              {timeline.description || 'Your chronological journey. Drag date pills to re-order event groups.'}
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
                {mode === 'edit' && (
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
                )}
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
                  : 'Create journal entries and add them to this timeline to see them here.'}
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
                            className={`bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all duration-200 ${
                              isDraggingThis
                                ? 'scale-110 shadow-lg ring-2 ring-blue-500/50 cursor-grabbing'
                                : 'hover:shadow-lg hover:scale-105'
                            } ${mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            onMouseDown={e => handleMouseDown(e, group.date)}
                            onTouchStart={e =>
                              handleTouchStart(e, group.date)
                            }
                            title={mode === 'edit' ? "Drag to re-order date group" : ""}
                          >
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
                              {format(groupDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          {/* Add horizontal connecting lines for desktop */}
                          <div className={`absolute top-1/2 ${isEven ? 'right-full' : 'left-full'} w-8 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 transform -translate-y-1/2`} />
                        </div>

                        <div className="md:hidden absolute left-2 top-4 transform -translate-x-1/2 z-20">
                          <div
                            className={`bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all duration-200 ${
                              isDraggingThis
                                ? 'scale-110 shadow-lg ring-2 ring-blue-500/50 cursor-grabbing'
                                : 'hover:shadow-lg hover:scale-105'
                            } ${mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            onMouseDown={e => handleMouseDown(e, group.date)}
                            onTouchStart={e =>
                              handleTouchStart(e, group.date)
                            }
                            title={mode === 'edit' ? "Drag to re-order date group" : ""}
                          >
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
                              {format(groupDate, 'MMM d')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Update mobile connecting line */}
                        <div className="md:hidden absolute left-8 top-6 transform -translate-y-1/2 w-8 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 z-10" />

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
                            <div className="space-y-4">
                              {group.events.map(event => (
                                <TimelineCard
                                  key={event.id}
                                  event={event}
                                  onEdit={handleEditEvent}
                                  onDelete={handleDeleteEvent}
                                  mode={mode}
                                  className={`z-9999 transform transition-all duration-300 hover:scale-[1.02] ${
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
