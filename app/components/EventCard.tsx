'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Event } from '../lib/types';
import { IoTimeOutline, IoCheckmark, IoClose, IoTrash } from 'react-icons/io5';
import { FaPencilAlt } from 'react-icons/fa';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  showTimelineBadge?: boolean;
  className?: string;
}

export function EventCard({ event, onEdit, onDelete, showTimelineBadge = true, className }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
    addToTimeline: event.addToTimeline,
  });

  const handleEdit = () => {
    setIsEditing(true);
    // Brief timeout to allow the hover state to clear
    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur?.();
    }, 50);
  };

  const handleSave = () => {
    if (editData.title.trim() && editData.description.trim()) {
      const updatedEvent: Event = {
        ...event,
        title: editData.title,
        description: editData.description,
        addToTimeline: editData.addToTimeline,
        updatedAt: new Date().toISOString(),
      };
      onEdit?.(updatedEvent);
      setIsEditing(false);
      // Brief timeout to allow the hover state to clear
      setTimeout(() => {
        (document.activeElement as HTMLElement)?.blur?.();
      }, 50);
    }
  };

  const handleCancel = useCallback(() => {
    setEditData({
      title: event.title,
      description: event.description,
      addToTimeline: event.addToTimeline,
    });
    setIsEditing(false);
    // Brief timeout to allow the hover state to clear
    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur?.();
    }, 50);
  }, [event.title, event.description, event.addToTimeline]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id);
    }
  };

  const handleTimelineToggle = (checked: boolean) => {
    const updatedEvent: Event = {
      ...event,
      addToTimeline: checked,
      updatedAt: new Date().toISOString(),
    };
    onEdit?.(updatedEvent);
  };

  // Handle escape key to cancel editing
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
                className={cn(
                  'w-full px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                  'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                  'text-text-primary text-lg font-semibold',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
                )}
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
        </div>
        
        <div className="flex items-center space-x-2">
          {showTimelineBadge && event.addToTimeline && !isEditing && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <IoTimeOutline className="w-3 h-3 mr-1" />
              Timeline
            </span>
          )}
          
          {isEditing ? (
            <div className="flex space-x-1">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="w-10 h-10 p-0 button-transition"
                title="Cancel"
                onMouseDown={(e) => e.currentTarget.blur()}
              >
                <IoClose className="w-6 h-6" />
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="w-10 h-10 p-0 button-transition"
                title="Save"
                onMouseDown={(e) => e.currentTarget.blur()}
              >
                <IoCheckmark className="w-6 h-6" />
              </GlassButton>
            </div>
          ) : (
            <div className="flex space-x-1">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="w-10 h-10 p-0 button-transition"
                title="Edit"
                onMouseDown={(e) => e.currentTarget.blur()}
              >
                <FaPencilAlt className="w-6 h-6" />
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="w-10 h-10 p-0 text-red-500 hover:text-red-700 button-transition"
                title="Delete"
                onMouseDown={(e) => e.currentTarget.blur()}
              >
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
                className={cn(
                  'w-full px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                  'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                  'text-text-primary resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
                )}
                rows={3}
                placeholder="Event description..."
              />
              <div className="flex justify-end">
                <span className="text-xs text-text-muted">
                  {editData.description.length}/250
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`timeline-${event.id}`}
                checked={editData.addToTimeline}
                onChange={(e) => setEditData(prev => ({ ...prev, addToTimeline: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor={`timeline-${event.id}`} className="text-sm text-text-primary">
                Add to timeline
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  // Custom styling for markdown elements
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
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-text-muted">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {event.description}
              </ReactMarkdown>
            </div>
            
            {/* Always visible timeline checkbox */}
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-200/30 dark:border-gray-700/30">
              <input
                type="checkbox"
                id={`timeline-always-${event.id}`}
                checked={event.addToTimeline}
                onChange={(e) => handleTimelineToggle(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor={`timeline-always-${event.id}`} className="text-sm text-text-primary">
                Add to timeline
              </label>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default EventCard; 