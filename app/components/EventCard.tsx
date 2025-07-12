'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Event, Timeline } from '../lib/types';
import { IoTimeOutline, IoCheckmark, IoClose, IoTrash, IoChevronDown, IoEllipsisVertical } from 'react-icons/io5';
import { FaPencilAlt } from 'react-icons/fa';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  className?: string;
  allTimelines: Timeline[];
}

export function EventCard({ event, onEdit, onDelete, className, allTimelines }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDateEditing, setIsDateEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
  });
  const [associatedTimelines, setAssociatedTimelines] = useState<Timeline[]>([]);
  const [isTimelineDropdownOpen, setIsTimelineDropdownOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchAssociatedTimelines = async () => {
      if (event.timelineIds && event.timelineIds.length > 0) {
        // We can find the timeline details from the `allTimelines` prop
        const associated = allTimelines.filter(t => event.timelineIds.includes(t.id));
        setAssociatedTimelines(associated);
      } else {
        setAssociatedTimelines([]);
      }
    };

    fetchAssociatedTimelines();
  }, [event.timelineIds, allTimelines]);

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
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id);
    }
  };

  const handleTimelineSelection = (timelineId: string) => {
    const newTimelineIds = (event.timelineIds || []).includes(timelineId)
        ? (event.timelineIds || []).filter(id => id !== timelineId)
        : [...(event.timelineIds || []), timelineId];
    
    const updatedEvent: Event = {
        ...event,
        timelineIds: newTimelineIds,
        updatedAt: new Date().toISOString(),
    };
    onEdit?.(updatedEvent);
  };

  const shouldTruncateDescription = (description: string) => {
    // Check if description is long enough to potentially span more than 2 lines
    return description.length > 100;
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          handleCancel();
        } else if (isDateEditing) {
          handleDateCancel();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditing, isDateEditing, handleCancel]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isActionsDropdownOpen || isTimelineDropdownOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.actions-dropdown') && !target.closest('.timeline-dropdown')) {
          setIsActionsDropdownOpen(false);
          setIsTimelineDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionsDropdownOpen, isTimelineDropdownOpen]);

  return (
    <GlassCard variant="default" className={cn('p-4 hover:shadow-lg transition-all duration-300', className)}>
      {/* Title Row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 35) {
                    setEditData(prev => ({ ...prev, title: value }));
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
            <h3 className="text-lg font-semibold text-text-primary pr-2">
              {event.title}
            </h3>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex space-x-1">
            <GlassButton variant="ghost" size="sm" onClick={handleCancel} title="Cancel">
              <IoClose className="w-6 h-6" />
            </GlassButton>
            <GlassButton variant="ghost" size="sm" onClick={handleSave} title="Save">
              <IoCheckmark className="w-6 h-6" />
            </GlassButton>
          </div>
        ) : (
          <div className="relative actions-dropdown">
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

      {/* Date Row */}
      <div className="mb-3">
        {isDateEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={event.date.split('T')[0]} // Convert ISO date to YYYY-MM-DD format
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                newDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
                handleDateChange(newDate.toISOString());
              }}
              className="px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            />
            <GlassButton variant="ghost" size="sm" onClick={handleDateCancel} title="Cancel">
              <IoClose className="w-4 h-4" />
            </GlassButton>
          </div>
        ) : (
          <button
            onClick={handleDateClick}
            className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer text-left"
            title="Click to change date"
          >
            {format(new Date(event.date), 'MMMM d')}
          </button>
        )}
        
        {/* Associated Timelines */}
        {associatedTimelines.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {associatedTimelines.map(timeline => (
              <span key={timeline.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <IoTimeOutline className="w-3 h-3 mr-1" />
                {timeline.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <textarea
                value={editData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 250) {
                    setEditData(prev => ({ ...prev, description: value }));
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
              <div className={`text-text-secondary ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-text-secondary mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="text-text-primary font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-text-secondary italic">{children}</em>,
                    ul: ({ children }) => <ul className="text-text-secondary ml-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="text-text-secondary ml-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="text-text-secondary mb-1">{children}</li>,
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
              
              {/* Show more button positioned right after the clamped text */}
              {shouldTruncateDescription(event.description) && !isDescriptionExpanded && (
                <button
                  onClick={() => setIsDescriptionExpanded(true)}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium mt-1"
                >
                  Show more
                </button>
              )}
            </div>
            
            {/* Show less button for expanded descriptions */}
            {shouldTruncateDescription(event.description) && isDescriptionExpanded && (
              <button
                onClick={() => setIsDescriptionExpanded(false)}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Timeline Dropdown */}
      <div className="relative timeline-dropdown">
        <button
          type="button"
          onClick={() => setIsTimelineDropdownOpen(!isTimelineDropdownOpen)}
          className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm flex justify-between items-center text-left"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)', backgroundColor: 'var(--surface-elevated)' }}
        >
          <span>
            {(event.timelineIds || []).length > 0
              ? `${(event.timelineIds || []).length} timeline(s) selected`
              : 'Add to timeline'}
          </span>
          <IoChevronDown className={`transition-transform duration-200 ${isTimelineDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isTimelineDropdownOpen && (
          <div className="absolute w-full mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-300/30 dark:border-gray-700/30 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
            {allTimelines.map(timeline => (
              <label key={timeline.id} className="flex items-center px-3 py-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(event.timelineIds || []).includes(timeline.id)}
                  onChange={() => handleTimelineSelection(timeline.id)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <span className="ml-3 text-sm text-text-primary">{timeline.name}</span>
              </label>
            ))}
             {allTimelines.length === 0 && (
                <div className="px-3 py-2 text-sm text-text-muted">No timelines available.</div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default EventCard;