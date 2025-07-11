'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { IoCalendarOutline, IoEyeOutline, IoCheckmark, IoClose, IoTrash } from 'react-icons/io5';
import { FaPencilAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Event } from '../lib/types';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface TimelineCardProps {
  event: Event;
  className?: string;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

export function TimelineCard({ event, className, onEdit, onDelete }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
    addToTimeline: event.addToTimeline,
  });

  const eventDate = new Date(event.date);
  
  // Truncate description for collapsed view
  const truncatedDescription = event.description.length > 120 
    ? event.description.substring(0, 120) + '...'
    : event.description;

  const shouldShowReadMore = event.description.length > 120;

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
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
    }
  };

  const handleCancel = useCallback(() => {
    setEditData({
      title: event.title,
      description: event.description,
      addToTimeline: event.addToTimeline,
    });
    setIsEditing(false);
  }, [event.title, event.description, event.addToTimeline]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      onDelete?.(event.id);
    }
    setShowActions(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
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
    <GlassCard 
      variant="secondary" 
      className={cn(
        'group relative p-5 shadow-lg border border-gray-200/50 dark:border-gray-700/50',
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl',
        'transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10',
        'hover:border-blue-300/50 dark:hover:border-blue-600/50',
        'hover:bg-white/90 dark:hover:bg-gray-800/90',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Actions Menu */}
      {showActions && !isEditing && (onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
          {onEdit && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="w-10 h-10 p-0 opacity-70 hover:opacity-100 transition-opacity"
              title="Edit event"
            >
              <FaPencilAlt className="w-6 h-6" />
            </GlassButton>
          )}
          {onDelete && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="w-10 h-10 p-0 opacity-70 hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
              title="Delete event"
            >
              <IoTrash className="w-6 h-6" />
            </GlassButton>
          )}
        </div>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="w-10 h-10 p-0 opacity-70 hover:opacity-100 transition-opacity"
            title="Cancel"
          >
            <IoClose className="w-6 h-6" />
          </GlassButton>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="w-10 h-10 p-0 opacity-70 hover:opacity-100 transition-opacity text-green-500 hover:text-green-600"
            title="Save"
          >
            <IoCheckmark className="w-6 h-6" />
          </GlassButton>
        </div>
      )}
      
      {/* Date Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/30 dark:border-gray-700/30">
        <IoCalendarOutline className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 flex-1">
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {format(eventDate, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>
      
      {/* Event Content */}
      <div className="space-y-3">
        {/* Title */}
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
                'w-full px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                'text-text-primary text-lg font-bold',
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
          <h3 className="font-bold text-text-primary text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {event.title}
          </h3>
        )}
        
        {/* Description */}
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
                  'w-full px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                  'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                  'text-text-primary resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                  'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
                )}
                rows={4}
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
                id={`timeline-edit-${event.id}`}
                checked={editData.addToTimeline}
                onChange={(e) => setEditData(prev => ({ ...prev, addToTimeline: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor={`timeline-edit-${event.id}`} className="text-sm text-text-primary">
                Add to timeline
              </label>
            </div>
          </div>
        ) : (
          <div className="text-text-secondary text-sm leading-relaxed">
            <ReactMarkdown 
              components={{
                // Customize markdown components for timeline cards
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-text-primary">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-text-primary">{children}</h3>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-blue-500 pl-3 italic text-text-muted">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {isExpanded ? event.description : truncatedDescription}
            </ReactMarkdown>
          </div>
        )}

        {/* Read More/Less Button */}
        {shouldShowReadMore && !isEditing && (
          <div className="flex justify-end">
            <button
              onClick={toggleExpanded}
              className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <IoEyeOutline className="w-3 h-3" />
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          </div>
        )}
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </GlassCard>
  );
}

export default TimelineCard; 