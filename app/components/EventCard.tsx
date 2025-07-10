'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Event } from '../lib/types';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  className?: string;
}

export function EventCard({ event, onEdit, onDelete, className }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
    addToTimeline: event.addToTimeline,
  });

  const handleEdit = () => {
    setIsEditing(true);
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

  const handleCancel = () => {
    setEditData({
      title: event.title,
      description: event.description,
      addToTimeline: event.addToTimeline,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id);
    }
  };

  return (
    <GlassCard variant="default" className={cn('p-4 hover:shadow-lg transition-all duration-300', className)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className={cn(
                'w-full px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                'text-text-primary text-lg font-semibold',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
              )}
              autoFocus
            />
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
          {event.addToTimeline && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </span>
          )}
          
          {isEditing ? (
            <div className="flex space-x-1">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="w-8 h-8 p-0"
                title="Save"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="w-8 h-8 p-0"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </GlassButton>
            </div>
          ) : (
            <div className="flex space-x-1">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="w-8 h-8 p-0"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="w-8 h-8 p-0 text-red-500 hover:text-red-600"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </GlassButton>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className={cn(
                'w-full px-2 py-1 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                'text-text-primary resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
              )}
              rows={3}
            />
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
        )}
      </div>
    </GlassCard>
  );
}

export default EventCard; 