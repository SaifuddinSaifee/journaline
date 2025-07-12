"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import {
  format,
  startOfWeek,
  differenceInCalendarDays,
  startOfMonth,
  addDays,
} from "date-fns";
import { motion, Reorder } from "framer-motion";
import { useTimelineEvents } from "../lib/hooks";
import { Event, Timeline as TimelineType } from "../lib/types";
import { eventService } from "../lib/eventService";
import { timelineService } from '../lib/timelineService';
import GlassCard from "./GlassCard";
import TimelineCard from "./TimelineCard";
import DateRangeSelector, { DateRange } from "./DateRangeSelector";
import GroupBySelector, { Grouping } from "./GroupBySelector";

// (Spacing constants no longer needed)

// DragState and absolute-position helpers removed – Reorder.Group now handles drag.

// Helper component will be defined later (after utility fns) to ensure access to helpers

interface TimelineProps {
  timeline: TimelineType;
  mode?: 'view' | 'edit';
}

export function Timeline({ timeline, mode = 'view' }: TimelineProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // Grouping mode state
  const [grouping, setGrouping] = useState<Grouping>("daily");
  
  // Use timelineId from props to fetch events
  const { events, loading, error, refetch } = useTimelineEvents({
    timelineId: timeline.id,
    dateRange,
  });

  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);
  // Order of groups (dates)
  const [groupOrder, setGroupOrder] = useState<string[]>(timeline.groupOrder || []);
  
  const [isResetting, setIsResetting] = useState(false);

  // Whenever the grouping mode changes, clear the order so it can re-initialise chronologically
  useEffect(() => {
    setGroupOrder([]);
  }, [grouping]);

  // --------------------------------------------------
  // Helper functions for custom calendar calculations
  // --------------------------------------------------

  const getFirstMondayOfYear = (year: number) => {
    const jan1 = new Date(year, 0, 1);
    const day = jan1.getDay(); // 0-Sun, 1-Mon
    const offset = (8 - day) % 7;
    return new Date(year, 0, 1 + offset);
  };

  const getFirstMondayOfMonth = (date: Date) => {
    const firstDay = startOfMonth(date);
    const day = firstDay.getDay();
    const offset = (8 - day) % 7;
    return addDays(firstDay, offset);
  };

  const getWeekNumberCustom = (date: Date) => {
    const firstMonday = getFirstMondayOfYear(date.getFullYear());
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const diff = differenceInCalendarDays(start, firstMonday);
    return diff >= 0 ? Math.floor(diff / 7) + 1 : 0;
  };

  const getWeekOfMonthCustom = (date: Date) => {
    const firstMonday = getFirstMondayOfMonth(date);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const diff = differenceInCalendarDays(start, firstMonday);
    return diff >= 0 ? Math.floor(diff / 7) + 1 : 0;
  };

  const getGroupKey = (date: Date, mode: Grouping): string => {
    switch (mode) {
      case "monthly":
        return format(date, "yyyy-MM-01");
      case "yearly":
        return format(date, "yyyy-01-01");
      case "weekly":
        return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "daily":
      default:
        return format(date, "yyyy-MM-dd");
    }
  };

  const getGroupLabel = (key: string, mode: Grouping): string => {
    const date = new Date(key);
    switch (mode) {
      case "monthly":
        return format(date, "MMM yyyy");
      case "yearly":
        return format(date, "yyyy");
      case "weekly": {
        const wom = getWeekOfMonthCustom(date);
        const woy = getWeekNumberCustom(date);
        return `Week ${wom} | ${woy}`;
      }
      case "daily":
      default:
        return format(date, "MMM d, yyyy");
    }
  };

  // Group events by date
  const groupsByDate = useMemo(() => {
    if (!timelineEvents) return new Map();

    const groups: Record<string, Event[]> = {};
    timelineEvents.forEach(event => {
      const key = getGroupKey(new Date(event.date), grouping);
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });

    return new Map(Object.entries(groups).map(([key, events]) => [key, events]));
  }, [timelineEvents, grouping]);

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
  }, [events, groupsByDate, groupOrder.length]);


  // Persist layout changes to the database
  const persistOrder = useCallback(async (order: string[]) => {
    await timelineService.updateTimeline(timeline.id, {
      groupOrder: order,
    });
  }, [timeline.id]);
  
  // No explicit Y-coordinates needed any more – natural flow is used.

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

  const handleResetOrder = useCallback(async () => {
    setIsResetting(true);
    const chronologicalOrder = Array.from(groupsByDate.keys())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    setGroupOrder(chronologicalOrder);
    await persistOrder(chronologicalOrder);
    setIsResetting(false);
  }, [groupsByDate, persistOrder]);

  // Height now determined by content flow

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
                    onClick={handleResetOrder}
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
                <GroupBySelector value={grouping} onChange={setGrouping} />
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
            <div className="space-y-2 relative">
              {/* vertical timeline line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
              <div className="md:hidden absolute left-4 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />

              {mode === 'edit' ? (
                <Reorder.Group axis="y" values={groupOrder} onReorder={async (newOrder) => { setGroupOrder(newOrder); await persistOrder(newOrder); }} className="space-y-2">
                  {groupOrder.map((date, index) => {
                    const events = groupsByDate.get(date);
                    if (!events) return null;
                    const isEven = index % 2 === 0;
                    return (
                      <Reorder.Item key={date} value={date} className="relative w-full">
                        <GroupContent label={getGroupLabel(date, grouping)} events={events} isEven={isEven} mode={mode} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              ) : (
                <div className="space-y-2">
                  {orderedGroups.map((group, index) => (
                    <motion.div key={group.date} layout className="relative w-full">
                      <GroupContent label={getGroupLabel(group.date, grouping)} events={group.events} isEven={index % 2 === 0} mode={mode} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default Timeline;

// The rest of the file stays unchanged

// -----------------------------
// External GroupContent component (presentation-only)
// -----------------------------

interface GroupContentProps {
  label: string;
  events: Event[];
  isEven: boolean;
  mode: 'view' | 'edit';
  onEdit: (e: Event) => void;
  onDelete: (id: string) => void;
}

const GroupContent: React.FC<GroupContentProps> = ({ label, events, isEven, mode, onEdit, onDelete }) => {
  return (
    <div>
      {/* Date pill (desktop) */}
      <div className="hidden md:block absolute left-1/2 top-4 transform -translate-x-1/2 z-20">
        <div
          className={`bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all duration-200 ${mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
            {label}
          </span>
        </div>
        <div className={`absolute top-1/2 ${isEven ? 'right-full' : 'left-full'} w-8 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 transform -translate-y-1/2`} />
      </div>

      {/* Date pill (mobile) */}
      <div className="md:hidden absolute left-2 top-4 transform -translate-x-1/2 z-20">
        <div
          className={`bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all duration-200 ${mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
            {label}
          </span>
        </div>
      </div>

      {/* Mobile connecting line */}
      <div className="md:hidden absolute left-8 top-6 transform -translate-y-1/2 w-8 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 z-10" />

      {/* Events */}
      <div className={`md:flex ${isEven ? 'md:justify-start' : 'md:justify-end'} ml-14 md:ml-0`}>
        <div className={`w-full md:max-w-md ${isEven ? 'md:pr-8' : 'md:pl-8'} relative`}>
          <div className="space-y-4">
            {events.map(event => (
              <TimelineCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                mode={mode}
                className={`transform transition-all duration-300 hover:scale-[1.02] ${isEven ? 'md:hover:translate-x-1' : 'md:hover:-translate-x-1'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
