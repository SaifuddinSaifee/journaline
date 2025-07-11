'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Event, Timeline } from '../lib/types';
import { IoTimeOutline, IoCheckmark, IoClose, IoTrash, IoChevronDown } from 'react-icons/io5';
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
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
  });
  const [associatedTimelines, setAssociatedTimelines] = useState<Timeline[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
  }, [event.title, event.description]);

  const handleDelete = () => {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditing, handleCancel]);

  return (
    <GlassCard variant="default" className={cn('p-4 hover:shadow-lg transition-all duration-300', className)}>
      <div className="flex justify-between items-start mb-3">
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
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {event.title}
            </h3>
          )}
          <p className="text-sm text-text-muted">
            {format(new Date(event.date), 'MMMM d, yyyy')}
          </p>
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
        
        <div className="flex items-center space-x-2">
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
            <div className="flex space-x-1">
              <GlassButton variant="ghost" size="sm" onClick={handleEdit} title="Edit">
                <FaPencilAlt className="w-5 h-5" />
              </GlassButton>
              <GlassButton variant="ghost" size="sm" onClick={handleDelete} className="text-red-500" title="Delete">
                <IoTrash className="w-6 h-6" />
              </GlassButton>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
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
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none dark:prose-invert">
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
          </div>
        )}
      </div>
      
      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm flex justify-between items-center text-left"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)', backgroundColor: 'var(--surface-elevated)' }}
        >
          <span>
            {(event.timelineIds || []).length > 0
              ? `${(event.timelineIds || []).length} timeline(s) selected`
              : 'Add to a timeline'}
          </span>
          <IoChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute w-full mt-1 bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
            {allTimelines.map(timeline => (
              <label key={timeline.id} className="flex items-center px-3 py-2 hover:bg-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(event.timelineIds || []).includes(timeline.id)}
                  onChange={() => handleTimelineSelection(timeline.id)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 border-gray-600 bg-gray-700"
                />
                <span className="ml-3 text-sm text-gray-200">{timeline.name}</span>
              </label>
            ))}
             {allTimelines.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">No timelines available.</div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default EventCard;