"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";
import GlassCard from "./GlassCard";
import GlassButton from "./GlassButton";
import { Event, Timeline } from "../lib/types";
import {
  IoTrash,
  IoChevronDown,
  IoEllipsisVertical,
} from "react-icons/io5";
import TimelineAvatarGroup from "./TimelineAvatarGroup";
import { FaPencilAlt } from "react-icons/fa";

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onView?: (event: Event) => void;
  onEditModal?: (event: Event) => void; // Add this new prop for opening edit modal
  className?: string;
  allTimelines: Timeline[];
  associatedTimelines: Timeline[]; // Add this prop to avoid recalculation
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onView,
  onEditModal,
  className,
  allTimelines,
  associatedTimelines,
}: EventCardProps) {
  // Remove inline editing states - we only need dropdown states now
  const [isTimelineDropdownOpen, setIsTimelineDropdownOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  // Refs for content
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Remove inline editing handlers - Edit button will now trigger modal
  const handleEdit = () => {
    setIsActionsDropdownOpen(false);
    onEditModal?.(event); // Use onEditModal for edit button, opens directly in edit mode
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

  // Remove escape key handler since no inline editing

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons or timeline dropdown
    if (
      e.target instanceof Element && 
      (e.target.closest('.actions-dropdown') || 
       e.target.closest('.timeline-dropdown'))
    ) {
      return;
    }
    onView?.(event);
  };

  return (
    <GlassCard
      variant="default"
      className={cn(
        "p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Title Row - Fixed Height - Remove inline editing UI */}
      <div className="flex justify-between items-start mb-2 min-h-[3rem]">
        <div className="flex-1 pr-2">
          <div className="space-y-1">
            <div
              ref={titleRef}
              className="text-lg font-semibold text-text-primary break-words"
            >
              {event.title}
            </div>
          </div>
        </div>

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
      </div>

      {/* Date Row - Fixed Height - Remove inline editing UI */}
      <div className="mb-3 min-h-[2rem] flex items-start">
        <div className="w-full">
          <div className="text-sm text-text-muted">
            {format(new Date(event.date), "MMMM d")}
          </div>
        </div>
      </div>

      {/* Description - Flexible Height - Remove inline editing UI */}
      <div className="mb-4 flex-grow">
        <div className="space-y-2">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div
              ref={descriptionRef}
              className="text-text-secondary break-words"
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-text-secondary mb-2 last:mb-0 break-words">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-text-primary font-semibold break-words">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-text-secondary italic break-words">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-text-secondary ml-4 list-disc break-words">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-text-secondary ml-4 list-decimal break-words">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-text-secondary mb-1 break-words">{children}</li>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-text-primary break-all">
                      {children}
                    </code>
                  ),
                }}
              >
                {event.description}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Avatars */}
      {associatedTimelines.length > 0 && (
        <div className="mb-2">
          <TimelineAvatarGroup timelines={associatedTimelines} />
        </div>
      )}

      {/* Timeline Dropdown - Grounded to Bottom */}
      <div className="relative timeline-dropdown">
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
      </div>
    </GlassCard>
  );
}

export default EventCard;
