"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";
import GlassCard from "./GlassCard";
import GlassButton from "./GlassButton";
import { Event, Timeline } from "../lib/types";
import {
  IoTimeOutline,
  IoCheckmark,
  IoClose,
  IoTrash,
  IoChevronDown,
  IoEllipsisVertical,
} from "react-icons/io5";
import { FaPencilAlt } from "react-icons/fa";

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  className?: string;
  allTimelines: Timeline[];
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  className,
  allTimelines,
}: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDateEditing, setIsDateEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
  });
  const [associatedTimelines, setAssociatedTimelines] = useState<Timeline[]>(
    []
  );
  const [isTimelineDropdownOpen, setIsTimelineDropdownOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [needsTitleTruncation, setNeedsTitleTruncation] = useState(false);
  const [needsDescriptionTruncation, setNeedsDescriptionTruncation] =
    useState(false);

  // Refs for measuring content overflow
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssociatedTimelines = async () => {
      if (event.timelineIds && event.timelineIds.length > 0) {
        // We can find the timeline details from the `allTimelines` prop
        const associated = allTimelines.filter((t) =>
          event.timelineIds.includes(t.id)
        );
        setAssociatedTimelines(associated);
      } else {
        setAssociatedTimelines([]);
      }
    };

    fetchAssociatedTimelines();
  }, [event.timelineIds, allTimelines]);

  // Measure content overflow to determine if truncation is needed
  useEffect(() => {
    const measureTruncation = () => {
      // Measure title truncation
      if (titleRef.current) {
        const element = titleRef.current;
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setNeedsTitleTruncation(isOverflowing);
      }

      // Measure description truncation
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setNeedsDescriptionTruncation(isOverflowing);
      }
    };

    // Measure after render with a small delay to ensure DOM is updated
    const timer = setTimeout(measureTruncation, 100);
    return () => clearTimeout(timer);
  }, [event.title, event.description, isTitleExpanded, isDescriptionExpanded]);

  const handleEdit = () => {
    setIsEditing(true);
    setIsActionsDropdownOpen(false);
  };

  const handleSave = () => {
    if (editData.title.trim() && editData.description.trim()) {
      const updatedEvent: Event = {
        ...event,
        title: editData.title,
        description: editData.description,
        timelineIds: event.timelineIds || [],
        updatedAt: new Date().toISOString(),
      };
      onEdit?.(updatedEvent);
      setIsEditing(false);
    }
  };

  const handleCancel = useCallback(() => {
    setEditData({
      title: event.title,
      description: event.description,
    });
    setIsEditing(false);
    setIsDateEditing(false);
  }, [event.title, event.description]);

  const handleDateClick = () => {
    setIsDateEditing(true);
  };

  const handleDateChange = (newDate: string) => {
    const updatedEvent: Event = {
      ...event,
      date: newDate,
      updatedAt: new Date().toISOString(),
    };
    onEdit?.(updatedEvent);
    setIsDateEditing(false);
  };

  const handleDateCancel = () => {
    setIsDateEditing(false);
  };

  const handleDelete = () => {
    setIsActionsDropdownOpen(false);
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDelete?.(event.id);
    }
  };

  const handleTimelineSelection = (timelineId: string) => {
    const newTimelineIds = (event.timelineIds || []).includes(timelineId)
      ? (event.timelineIds || []).filter((id) => id !== timelineId)
      : [...(event.timelineIds || []), timelineId];

    const updatedEvent: Event = {
      ...event,
      timelineIds: newTimelineIds,
      updatedAt: new Date().toISOString(),
    };
    onEdit?.(updatedEvent);
  };

  // Simple heuristic to determine if content likely needs truncation
  const shouldShowTruncation = (
    content: string,
    type: "title" | "description"
  ) => {
    if (type === "title") {
      return content.length > 40; // Lowered from 50 to 40
    }
    return content.length > 80; // Lowered from 120 to 80 - approximately 2 lines in card width
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          handleCancel();
        } else if (isDateEditing) {
          handleDateCancel();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isEditing, isDateEditing, handleCancel]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isActionsDropdownOpen || isTimelineDropdownOpen) {
        const target = e.target as HTMLElement;
        if (
          !target.closest(".actions-dropdown") &&
          !target.closest(".timeline-dropdown")
        ) {
          setIsActionsDropdownOpen(false);
          setIsTimelineDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isActionsDropdownOpen, isTimelineDropdownOpen]);

  return (
    <GlassCard
      variant="default"
      className={cn(
        "p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full",
        className
      )}
    >
      {/* Title Row - Fixed Height */}
      <div className="flex justify-between items-start mb-2 min-h-[3rem]">
        <div className="flex-1 pr-2">
          {isEditing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 35) {
                    setEditData((prev) => ({ ...prev, title: value }));
                  }
                }}
                className="w-full px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-text-primary text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                autoFocus
                placeholder="Event title..."
              />
              <div className="flex justify-end">
                <span className="text-xs text-text-muted">
                  {editData.title.length}/35
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div
                ref={titleRef}
                className={`text-lg font-semibold text-text-primary cursor-pointer ${
                  !isTitleExpanded &&
                  (needsTitleTruncation ||
                    shouldShowTruncation(event.title, "title"))
                    ? "line-clamp-2"
                    : ""
                }`}
                onClick={() =>
                  (needsTitleTruncation ||
                    shouldShowTruncation(event.title, "title")) &&
                  setIsTitleExpanded(!isTitleExpanded)
                }
                title={
                  needsTitleTruncation ||
                  shouldShowTruncation(event.title, "title")
                    ? "Click to expand/collapse"
                    : undefined
                }
              >
                {event.title}
              </div>
              {(needsTitleTruncation ||
                shouldShowTruncation(event.title, "title")) &&
                !isTitleExpanded && (
                  <button
                    onClick={() => setIsTitleExpanded(true)}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Show more
                  </button>
                )}
              {(needsTitleTruncation ||
                shouldShowTruncation(event.title, "title")) &&
                isTitleExpanded && (
                  <button
                    onClick={() => setIsTitleExpanded(false)}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Show less
                  </button>
                )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="flex space-x-1 flex-shrink-0">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              title="Cancel"
            >
              <IoClose className="w-6 h-6" />
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleSave}
              title="Save"
            >
              <IoCheckmark className="w-6 h-6" />
            </GlassButton>
          </div>
        ) : (
          <div className="relative actions-dropdown flex-shrink-0">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
              title="Actions"
            >
              <IoEllipsisVertical className="w-5 h-5" />
            </GlassButton>

            {isActionsDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-300/30 dark:border-gray-700/30 rounded-lg shadow-xl z-20 min-w-32">
                <div className="py-1">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <IoTrash className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Row - Fixed Height for Consistent Alignment */}
      <div className="mb-3 min-h-[2rem] flex items-start">
        <div className="w-full">
          {isDateEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={event.date.split("T")[0]} // Convert ISO date to YYYY-MM-DD format
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  newDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
                  handleDateChange(newDate.toISOString());
                }}
                className="px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleDateCancel}
                title="Cancel"
              >
                <IoClose className="w-4 h-4" />
              </GlassButton>
            </div>
          ) : (
            <button
              onClick={handleDateClick}
              className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer text-left"
              title="Click to change date"
            >
              {format(new Date(event.date), "MMMM d")}
            </button>
          )}
        </div>
      </div>

      {/* Description - Flexible Height */}
      <div className="mb-4 flex-grow">
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <textarea
                value={editData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 250) {
                    setEditData((prev) => ({ ...prev, description: value }));
                  }
                }}
                className="w-full px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                rows={3}
                placeholder="Event description..."
              />
              <div className="flex justify-end">
                <span className="text-xs text-text-muted">
                  {editData.description.length}/250
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                ref={descriptionRef}
                className={`text-text-secondary ${
                  !isDescriptionExpanded &&
                  (needsDescriptionTruncation ||
                    shouldShowTruncation(event.description, "description"))
                    ? "line-clamp-2"
                    : ""
                }`}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-text-secondary mb-2 last:mb-0">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-text-primary font-semibold">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-text-secondary italic">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-text-secondary ml-4 list-disc">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="text-text-secondary ml-4 list-decimal">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-text-secondary mb-1">{children}</li>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-text-primary">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {event.description}
                </ReactMarkdown>
              </div>
            </div>

            {/* Show more/less buttons */}
            <div className="flex justify-start">
              {(needsDescriptionTruncation ||
                shouldShowTruncation(event.description, "description")) &&
                !isDescriptionExpanded && (
                  <button
                    onClick={() => setIsDescriptionExpanded(true)}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Show more
                  </button>
                )}
              {(needsDescriptionTruncation ||
                shouldShowTruncation(event.description, "description")) &&
                isDescriptionExpanded && (
                  <button
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Show less
                  </button>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Dropdown - Grounded to Bottom */}
      <div className="relative timeline-dropdown mt-auto">
        <button
          type="button"
          onClick={() => setIsTimelineDropdownOpen(!isTimelineDropdownOpen)}
          className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm flex justify-between items-center text-left"
          style={{
            color: "var(--text-primary)",
            borderColor: "var(--glass-border)",
            backgroundColor: "var(--surface-elevated)",
          }}
        >
          {/* Show count of active (non-archived) timelines only */}
          <span>
            {associatedTimelines.length > 0
              ? `${associatedTimelines.length} timeline(s) selected`
              : "Add to timeline"}
          </span>
          <IoChevronDown
            className={`transition-transform duration-200 ${
              isTimelineDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isTimelineDropdownOpen && (
          <div className="absolute w-full mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-300/30 dark:border-gray-700/30 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
            {allTimelines.map((timeline) => (
              <label
                key={timeline.id}
                className="flex items-center px-3 py-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(event.timelineIds || []).includes(timeline.id)}
                  onChange={() => handleTimelineSelection(timeline.id)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <span className="ml-3 text-sm text-text-primary">
                  {timeline.name}
                </span>
              </label>
            ))}
            {allTimelines.length === 0 && (
              <div className="px-3 py-2 text-sm text-text-muted">
                No timelines available.
              </div>
            )}
          </div>
        )}
        {/* Associated Timelines */}
        {associatedTimelines.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {associatedTimelines.map((timeline) => (
              <span
                key={timeline.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              >
                <IoTimeOutline className="w-3 h-3 mr-1" />
                {timeline.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default EventCard;
