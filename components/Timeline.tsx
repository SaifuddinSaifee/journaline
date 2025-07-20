"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  IoTimeOutline,
  IoCalendarOutline,
  IoGitBranchOutline,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";
import { FaPencilAlt } from "react-icons/fa";
import {
  format,
  startOfWeek,
  differenceInCalendarDays,
} from "date-fns";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useTimelineEvents } from "../lib/hooks";
import { Event, Timeline as TimelineType, SortPreference } from "../lib/types";
import { eventService } from "../lib/eventService";
import { timelineService } from '../lib/timelineService';
import { cn } from "../lib/utils";
import GlassCard from "./GlassCard";
import TimelineCard from "./TimelineCard";
import DateRangeSelector, { DateRange } from "./DateRangeSelector";
import GroupBySelector, { Grouping } from "./GroupBySelector";
import SortSelector from "./SortSelector";
import TimelineResponsive from "./TimelineResponsive";
import GlassButton from "./GlassButton";
import GlassMessageBox from "./GlassMessageBox";
import { useDrag } from "./DragContext";

interface TimelineProps {
  timeline: TimelineType;
  mode?: 'view' | 'edit';
  onTimelineUpdate?: (updatedTimeline: TimelineType) => void;
}

export function Timeline({ timeline, mode = 'view', onTimelineUpdate }: TimelineProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // Timeline metadata editing state
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editMetadata, setEditMetadata] = useState({
    name: timeline.name,
    description: timeline.description || '',
  });
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  // Grouping mode state
  const [grouping, setGrouping] = useState<Grouping>("daily");
  // View-transition flag – enables fancy animation & prevents flicker
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isForking, setIsForking] = useState(false);
  
  // Sort preference state
  const [sortPreference, setSortPreference] = useState<SortPreference>(
    timeline.sortPreference || { field: 'date', order: 'desc' }
  );
  
  // Drag and drop state
  const { dragState } = useDrag();
  
  // Use timelineId from props to fetch events
  const { events, loading, error, refetch } = useTimelineEvents({
    timelineId: timeline.id,
    dateRange,
  });

  const [timelineEvents, setTimelineEvents] = useState<Event[]>([]);
  // Order of groups (dates)
  const [groupOrder, setGroupOrder] = useState<string[]>(timeline.groupOrder || []);
  
  // Reset edit metadata when timeline changes
  useEffect(() => {
    setEditMetadata({
      name: timeline.name,
      description: timeline.description || '',
    });
  }, [timeline.name, timeline.description]);
  
  // Sort events based on sortPreference
  const sortEvents = useCallback((eventsToSort: Event[]) => {
    return [...eventsToSort].sort((a, b) => {
      const aValue = new Date(a[sortPreference.field]).getTime();
      const bValue = new Date(b[sortPreference.field]).getTime();
      return sortPreference.order === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [sortPreference]);

  // Group events by date
  const groupsByDate = useMemo(() => {
    if (!timelineEvents) return new Map();

    const sortedEvents = sortEvents(timelineEvents);
    const groups: Record<string, Event[]> = {};
    sortedEvents.forEach(event => {
      const key = getGroupKey(new Date(event.date), grouping);
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });

    return new Map(Object.entries(groups).map(([key, events]) => [key, events]));
  }, [timelineEvents, grouping, sortEvents]);

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

  // When the user switches grouping views (isTransitioning is true),
  // we should maintain the saved order from the database
  useEffect(() => {
    if (!isTransitioning) return;
    
    // Get all valid dates from groupsByDate
    const validDates = Array.from(groupsByDate.keys());
    
    if (timeline.groupOrder && timeline.groupOrder.length > 0) {
      // Filter the saved order to only include dates that exist in current view
      const validSavedOrder = timeline.groupOrder.filter(date => validDates.includes(date));
      
      // Add any new dates that aren't in the saved order
      const newDates = validDates.filter(date => !validSavedOrder.includes(date));
      const newDatesSorted = newDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      // Combine saved order with new dates
      setGroupOrder([...validSavedOrder, ...newDatesSorted]);
    } else {
      // If no saved order exists, fall back to chronological
      const chronologicalOrder = validDates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      setGroupOrder(chronologicalOrder);
    }
  }, [isTransitioning, groupsByDate, timeline.groupOrder]);

  // Turn off transition flag once new ordered groups are ready
  useEffect(() => {
    if (isTransitioning && orderedGroups.length > 0) {
      setIsTransitioning(false);
    }
  }, [orderedGroups, isTransitioning]);

  // Handle grouping changes with transition trigger
  const handleGroupingChange = (newGrouping: Grouping) => {
    if (newGrouping === grouping) return;
    setIsTransitioning(true);
    setGrouping(newGrouping);
  };

  const getFirstMondayOfYear = (year: number) => {
    const jan1 = new Date(year, 0, 1);
    const day = jan1.getDay(); // 0-Sun, 1-Mon
    const offset = (8 - day) % 7;
    return new Date(year, 0, 1 + offset);
  };

  const getWeekNumberCustom = (date: Date) => {
    const firstMonday = getFirstMondayOfYear(date.getFullYear());
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const diff = differenceInCalendarDays(start, firstMonday);
    return diff >= 0 ? Math.floor(diff / 7) + 1 : 0;
  };

  // Use a regular function so it gets hoisted and is available before first use
  function getGroupKey(date: Date, mode: Grouping): string {
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
  }

  const getGroupLabel = (key: string, mode: Grouping): string => {
    const date = new Date(key);
    switch (mode) {
      case "monthly":
        return format(date, "MMM yyyy");
      case "yearly":
        return format(date, "yyyy");
      case "weekly": {
        // Find the index of this week group in the ordered groups
        const weekIndex = orderedGroups.findIndex(group => group.date === key);
        const totalWeeks = orderedGroups.length;
        const weekNumber = totalWeeks - weekIndex; // Reverse the numbering
        const woy = getWeekNumberCustom(date); // Keep the year week number for reference
        return `Week ${weekNumber} | ${woy}`;
      }
      case "daily":
      default:
        return format(date, "MMM d, yyyy");
    }
  };

  // Sync with fetched events and initialize order/positions if needed
  useEffect(() => {
    setTimelineEvents(events);

    const validDates = Array.from(groupsByDate.keys());
    const chronologicalOrder = validDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Check if current groupOrder is valid against the actual event dates
    const isGroupOrderValid = groupOrder.length > 0 && groupOrder.every(date => validDates.includes(date)) 
      && validDates.every(date => groupOrder.includes(date));

    // Reset groupOrder if it's invalid, empty, or doesn't match current events
    if (!isGroupOrderValid && chronologicalOrder.length > 0) {
      setGroupOrder(chronologicalOrder);
    }
  }, [events, groupsByDate, groupOrder]);

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
    console.log(`🗑️ TIMELINE EDIT MODE: Removing event ${eventId} from timeline ${timeline.id} (NOT permanently deleting)`);
    
    try {
      // Get the current event data to ensure we have the complete timelineIds array
      const { data: currentEvent, error: fetchError } = await eventService.getEventById(eventId);
      
      if (fetchError || !currentEvent) {
        console.error('Error fetching event:', fetchError || 'Event not found');
        return;
      }

      console.log(`📋 Event before removal - timelineIds:`, currentEvent.timelineIds);

      // Remove current timeline ID from the event's timelineIds
      const updatedTimelineIds = currentEvent.timelineIds.filter(id => id !== timeline.id);
      
      console.log(`📝 Event after removal - timelineIds:`, updatedTimelineIds);

      // Update the event with the new timelineIds (removing this timeline)
      const result = await eventService.updateEvent(eventId, {
        timelineIds: updatedTimelineIds
      });
      
      if (result.error) {
        console.error('❌ Error removing event from timeline:', result.error);
      } else {
        console.log(`✅ SUCCESS: Event ${eventId} removed from timeline ${timeline.id}. Event still exists with timelines:`, updatedTimelineIds);
        console.log('🔄 Refreshing timeline events and notifying other components...');
        refetch(); // Refetch all events for this timeline
        const event = new CustomEvent('events-updated'); // Notify other components
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('💥 Unexpected error removing event from timeline:', err);
    }
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxConfig, setMessageBoxConfig] = useState<{
    title: string;
    message: string;
    variant: 'confirm' | 'success' | 'error';
    onConfirm?: () => void | Promise<void>;
  }>({
    title: '',
    message: '',
    variant: 'confirm',
  });

  const handleForkTimeline = async () => {
    if (isForking) return;

    setMessageBoxConfig({
      title: 'Fork Timeline',
      message: 'Are you sure you want to fork this timeline? This will create a new timeline containing all the events from the current view.',
      variant: 'confirm',
      onConfirm: async () => {
        setIsForking(true);
        try {
          const { data: forkedTimeline, error } = await timelineService.forkTimeline(timeline.id);

          if (error || !forkedTimeline) {
            throw new Error(error || 'Failed to fork timeline');
          }

          setMessageBoxConfig({
            title: 'Success',
            message: 'Timeline forked successfully! Redirecting to the new timeline.',
            variant: 'success',
            onConfirm: () => router.push(`/timeline/${forkedTimeline.id}/edit`)
          });
          setIsMessageBoxOpen(true);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred.';
          console.error('Forking error:', message);
          setMessageBoxConfig({
            title: 'Error',
            message: `Error: ${message}`,
            variant: 'error',
          });
          setIsMessageBoxOpen(true);
        } finally {
          setIsForking(false);
        }
      }
    });
    setIsMessageBoxOpen(true);
  };

  // Handle timeline metadata save
  const handleSaveMetadata = async () => {
    if (!editMetadata.name.trim()) {
      return; // Don't save if name is empty
    }

    setIsSavingMetadata(true);
    try {
      const { data: updatedTimeline, error } = await timelineService.updateTimeline(timeline.id, {
        name: editMetadata.name.trim(),
        description: editMetadata.description.trim(),
      });

      if (error) {
        console.error('Error updating timeline metadata:', error);
        // Reset to original values on error
        setEditMetadata({
          name: timeline.name,
          description: timeline.description || '',
        });
      } else if (updatedTimeline) {
        setIsEditingMetadata(false);
        onTimelineUpdate?.(updatedTimeline);
      }
    } catch (err) {
      console.error('Unexpected error updating timeline metadata:', err);
      // Reset to original values on error
      setEditMetadata({
        name: timeline.name,
        description: timeline.description || '',
      });
    } finally {
      setIsSavingMetadata(false);
    }
  };

  // Handle timeline metadata cancel
  const handleCancelMetadata = useCallback(() => {
    setEditMetadata({
      name: timeline.name,
      description: timeline.description || '',
    });
    setIsEditingMetadata(false);
  }, [timeline.name, timeline.description]);

  // Handle escape key to cancel metadata editing
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditingMetadata) {
        handleCancelMetadata();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditingMetadata, handleCancelMetadata]);

  // Handle sort preference change
  const handleSortChange = (newSortPreference: SortPreference) => {
    setSortPreference(newSortPreference);
  };

  // Handle sort apply and refresh view
  const handleSortApply = async (newSortPreference: SortPreference) => {
    setIsTransitioning(true);
    
    // Update sort preference in the database
    await timelineService.updateTimeline(timeline.id, {
      sortPreference: newSortPreference,
    });

    // Sort events based on new preference
    const sortedEvents = sortEvents(timelineEvents);
    setTimelineEvents(sortedEvents);

    // Update group order based on sorted events
    const newOrder = Array.from(new Set(sortedEvents.map(event => 
      getGroupKey(new Date(event.date), grouping)
    )));
    
    // Update group order in state and database
    setGroupOrder(newOrder);
    await timelineService.updateTimeline(timeline.id, {
      groupOrder: newOrder,
    });

    // Allow animation to complete
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
  };

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
      <GlassCard 
        variant="default" 
        className={cn(
          "min-h-96 transition-all duration-300 relative",
          dragState.isDragging && mode === 'edit' && "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-transparent shadow-xl",
          dragState.isHoveringDropZone && mode === 'edit' && "ring-4 ring-blue-400/60"
        )}
        data-timeline-drop-zone
      >
        <div className="p-4 sm:p-6">
          {/* Base drag state overlay - shown when dragging but not hovering */}
          {dragState.isDragging && !dragState.isHoveringDropZone && mode === 'edit' && (
            <div className="absolute inset-2 border-2 border-dashed border-blue-500/50 rounded-lg bg-blue-50/20 dark:bg-blue-950/20 flex items-center justify-center z-[5] pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <IoCalendarOutline className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Drop event here to add to timeline
                </p>
                <p className="text-blue-500/70 dark:text-blue-400/70 text-sm mt-1">
                  {timeline.name}
                </p>
              </div>
            </div>
          )}

          {/* Enhanced hover overlay - shown when hovering over timeline */}
          {dragState.isHoveringDropZone && mode === 'edit' && (
            <>
              {/* Blur overlay */}
              <div className="absolute inset-0 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 backdrop-blur-sm z-[10] pointer-events-none" />
              
              {/* Centered drop text - fixed position */}
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[20] pointer-events-none">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-blue-200/50 dark:border-blue-600/50"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <IoCalendarOutline className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    Drop event here
                  </h3>
                  <p className="text-blue-500/80 dark:text-blue-400/80 text-sm font-medium">
                    Add to &ldquo;{timeline.name}&rdquo;
                  </p>
                </motion.div>
              </div>
            </>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {/* Timeline Title - Editable in edit mode */}
              {mode === 'edit' && isEditingMetadata ? (
                <div className="flex-1 mr-4">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editMetadata.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 100) {
                          setEditMetadata(prev => ({ ...prev, name: value }));
                        }
                      }}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                        'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                        'text-2xl sm:text-3xl font-bold text-text-primary',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                        'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
                      )}
                      autoFocus
                      placeholder="Timeline title..."
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-text-muted">
                        {editMetadata.name.length}/100
                      </span>
                    </div>
                  </div>
                </div>
                             ) : (
                 <div className="flex-1 mr-4">
                   {mode === 'edit' ? (
                     <button
                       onClick={() => setIsEditingMetadata(true)}
                       className="text-left w-full group flex items-center gap-2"
                     >
                       <h2 className="text-2xl sm:text-3xl font-bold text-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                         {timeline.name}
                       </h2>
                       <FaPencilAlt className="w-4 h-4 text-text-muted group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                     </button>
                   ) : (
                     <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                       {timeline.name}
                     </h2>
                   )}
                 </div>
               )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {mode === 'edit' && isEditingMetadata && (
                  <div className="flex items-center gap-1">
                    <GlassButton
                      onClick={handleCancelMetadata}
                      variant="ghost"
                      size="sm"
                      disabled={isSavingMetadata}
                      className="w-10 h-10 p-0 opacity-70 hover:opacity-100 transition-opacity"
                      title="Cancel"
                    >
                      <IoClose className="w-5 h-5" />
                    </GlassButton>
                    <GlassButton
                      onClick={handleSaveMetadata}
                      variant="ghost"
                      size="sm"
                      disabled={isSavingMetadata || !editMetadata.name.trim()}
                      className="w-10 h-10 p-0 opacity-70 hover:opacity-100 transition-opacity text-green-500 hover:text-green-600"
                      title="Save"
                    >
                      {isSavingMetadata ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
                      ) : (
                        <IoCheckmark className="w-5 h-5" />
                      )}
                    </GlassButton>
                  </div>
                )}
                {!isEditingMetadata && (
                  <GlassButton
                    onClick={handleForkTimeline}
                    disabled={isForking}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <IoGitBranchOutline className="w-4 h-4" />
                    {isForking ? 'Forking...' : 'Fork Timeline'}
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Timeline Description - Editable in edit mode */}
            {mode === 'edit' && isEditingMetadata ? (
              <div className="space-y-1">
                <textarea
                  value={editMetadata.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      setEditMetadata(prev => ({ ...prev, description: value }));
                    }
                  }}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                    'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                    'text-text-secondary text-sm sm:text-base resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
                  )}
                  rows={2}
                  placeholder="Timeline description..."
                />
                <div className="flex justify-end">
                  <span className="text-xs text-text-muted">
                    {editMetadata.description.length}/500
                  </span>
                </div>
              </div>
                         ) : (
               <div>
                 {mode === 'edit' ? (
                   <button
                     onClick={() => setIsEditingMetadata(true)}
                     className="text-left w-full group"
                   >
                     <p className="text-text-secondary text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors inline">
                       {timeline.description || 'Your chronological journey. Drag date pills to re-order event groups.'}
                       <FaPencilAlt className="w-3 h-3 text-text-muted group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-200 opacity-0 group-hover:opacity-100 ml-2 inline-block" />
                     </p>
                   </button>
                 ) : (
                   <p className="text-text-secondary text-sm sm:text-base">
                     {timeline.description || 'Your chronological journey. Drag date pills to re-order event groups.'}
                   </p>
                 )}
               </div>
             )}
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-text-secondary">
                  {timelineEvents.length} event
                  {timelineEvents.length !== 1 ? 's' : ''} across{' '}
                  {orderedGroups.length}{' '}
                  {grouping === 'daily' ? (orderedGroups.length !== 1 ? 'days' : 'day') :
                   grouping === 'weekly' ? (orderedGroups.length !== 1 ? 'weeks' : 'week') :
                   grouping === 'monthly' ? (orderedGroups.length !== 1 ? 'months' : 'month') :
                   orderedGroups.length !== 1 ? 'years' : 'year'}
                  {dateRange.startDate && dateRange.endDate
                    ? ' in selected range'
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {mode === 'edit' && (
                  <>
                    <SortSelector
                      value={sortPreference}
                      onChange={handleSortChange}
                      onApply={handleSortApply}
                    />
                  </>
                )}
                <GroupBySelector value={grouping} onChange={handleGroupingChange} />
                <DateRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>
            </div>
          </div>

          {orderedGroups.length === 0 && !isTransitioning ? (
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
            <AnimatePresence mode="wait">
              <motion.div
                key={grouping}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.92 }}
                transition={{ duration: 0.55, ease: [0.43, 0.13, 0.23, 0.96] }}
                className="space-y-2 relative"
              >
                {/* vertical timeline line - desktop */}
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />
                
                {/* vertical timeline line - responsive */}
                <div className="lg:hidden absolute left-4 w-0.5 h-full bg-gradient-to-b from-blue-500 to-blue-300 dark:from-blue-400 dark:to-blue-600 opacity-60" />

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
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </GlassCard>
      <GlassMessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        onConfirm={messageBoxConfig.onConfirm}
        title={messageBoxConfig.title}
        message={messageBoxConfig.message}
        variant={messageBoxConfig.variant}
        loading={isForking}
        size="md"
        confirmText={messageBoxConfig.variant === 'confirm' ? 'Fork Timeline' : 'OK'}
        cancelText="Cancel"
        showIcon={true}
      />
    </div>
  );
}

export default Timeline;

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
      {/* Desktop layout (≥1024px) */}
      <div className="hidden lg:block">
        {/* Date pill (desktop) */}
        <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
          <div
            className={`bg-white z-[40] dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 select-none transition-all duration-200 ${mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 pointer-events-none">
              {label}
            </span>
          </div>
          <div className={`absolute top-1/2 z-10 ${isEven ? 'right-full' : 'left-full'} w-8 h-0.5 bg-blue-500 dark:bg-blue-400 opacity-70 transform -translate-y-1/2`} />
        </div>

        {/* Events */}
        <div className={`z-[30] flex ${isEven ? 'justify-start' : 'justify-end'}`}>
          <div className={`z-[30] w-full max-w-md ${isEven ? 'pr-8' : 'pl-8'} relative`}>
            <div className="space-y-4 z-[30]">
              {events.map(event => (
                <TimelineCard
                  key={event.id}
                  event={event}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  mode={mode}
                  className={`transform transition-all duration-300 hover:scale-[1.02] ${isEven ? 'hover:translate-x-1' : 'hover:-translate-x-1'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive layout (<1024px) */}
      <div className="block lg:hidden">
        <TimelineResponsive
          events={events}
          mode={mode}
          onEdit={onEdit}
          onDelete={onDelete}
          label={label}
        />
      </div>
    </div>
  );
};
