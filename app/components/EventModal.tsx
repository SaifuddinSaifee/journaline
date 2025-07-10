'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';
import { EventFormData } from '../lib/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => void;
  selectedDate: Date | null;
}

export function EventModal({ isOpen, onClose, onSave, selectedDate }: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    addToTimeline: false,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        addToTimeline: false,
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full animate-in zoom-in-95 duration-200">
        <GlassCard variant="default" className="p-6 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Add Event
              </h2>
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </GlassButton>
            </div>

            {selectedDate && (
              <div className="mb-4">
                <p className="text-sm text-text-secondary">
                  Date: {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                    'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                    'text-text-primary placeholder-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                    'transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-800/80'
                  )}
                  placeholder="Enter event title..."
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">
                  Description
                  <span className="text-xs text-text-muted ml-1">(Markdown supported)</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                    'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                    'text-text-primary placeholder-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                    'transition-all duration-200 resize-none hover:bg-white/80 dark:hover:bg-gray-800/80'
                  )}
                  placeholder="Enter event description..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addToTimeline"
                  checked={formData.addToTimeline}
                  onChange={(e) => handleInputChange('addToTimeline', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="addToTimeline" className="text-sm font-medium text-text-primary">
                  Add to timeline
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <GlassButton
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                disabled={!isFormValid}
                className={cn(
                  'transition-all duration-200',
                  !isFormValid && 'opacity-50 cursor-not-allowed'
                )}
              >
                Save
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

export default EventModal; 