'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';
import { EventFormData } from '../lib/types';
import { IoClose } from 'react-icons/io5';

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

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full animate-in zoom-in-95 duration-200">
        <GlassCard variant="strong" className="p-6 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add Event
              </h2>
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-10 h-10 p-0"
                style={{ color: 'var(--text-primary)' }}
              >
                <IoClose className="w-6 h-6" />
              </GlassButton>
            </div>

            {selectedDate && (
              <div className="mb-4">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Date: {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border',
                    'surface-elevated backdrop-blur-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'transition-all duration-200'
                  )}
                  style={{ 
                    color: 'var(--text-primary)',
                    borderColor: 'var(--glass-border)',
                    backgroundColor: 'var(--surface-elevated)'
                  }}
                  placeholder="Enter event title..."
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Description
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(Markdown supported)</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border',
                    'surface-elevated backdrop-blur-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'transition-all duration-200 resize-none'
                  )}
                  style={{ 
                    color: 'var(--text-primary)',
                    borderColor: 'var(--glass-border)',
                    backgroundColor: 'var(--surface-elevated)'
                  }}
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
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--surface-base)',
                    borderColor: 'var(--glass-border)'
                  }}
                />
                <label htmlFor="addToTimeline" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Add to timeline
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <GlassButton
                type="button"
                variant="ghost"
                onClick={onClose}
                style={{ color: 'var(--text-primary)' }}
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