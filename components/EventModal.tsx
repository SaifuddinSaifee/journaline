'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';
import { EventFormData, Timeline } from '../lib/types';
import { timelineService } from '../lib/timelineService';
import { IoClose, IoChevronDown } from 'react-icons/io5';

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
    timelineIds: [],
  });
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        timelineIds: [],
      });
      
      const fetchTimelines = async () => {
        const { data } = await timelineService.getAllTimelines();
        if (data) {
          // Exclude archived timelines
          setTimelines(data.filter(t => !t.isArchived));
        }
      };
      fetchTimelines();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Omit<EventFormData, 'timelineIds'>, value: string) => {
    const maxLength = field === 'title' ? 35 : 250;
    if (value.length > maxLength) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimelineSelection = (timelineId: string) => {
    setFormData(prev => {
      const newTimelineIds = prev.timelineIds.includes(timelineId)
        ? prev.timelineIds.filter(id => id !== timelineId)
        : [...prev.timelineIds, timelineId];
      return { ...prev, timelineIds: newTimelineIds };
    });
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
                  className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)', backgroundColor: 'var(--surface-elevated)' }}
                  placeholder="Enter event title..."
                  autoFocus
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formData.title.length}/35
                  </span>
                </div>
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
                  className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)', backgroundColor: 'var(--surface-elevated)' }}
                  placeholder="Enter event description..."
                  rows={4}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formData.description.length}/250
                  </span>
                </div>
              </div>

              {/* Timeline Multi-Select Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm flex justify-between items-center text-left"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)', backgroundColor: 'var(--surface-elevated)' }}
                >
                  <span>
                    {formData.timelineIds.length > 0
                      ? `${formData.timelineIds.length} timeline(s) selected`
                      : 'Add to a timeline'}
                  </span>
                  <IoChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
                    {timelines.length > 0 ? (
                      timelines.map(timeline => (
                        <label
                          key={timeline.id}
                          className="flex items-center px-3 py-2 hover:bg-white/10 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.timelineIds.includes(timeline.id)}
                            onChange={() => handleTimelineSelection(timeline.id)}
                            className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 border-gray-600 bg-gray-700"
                          />
                          <span className="ml-3 text-sm text-gray-200">{timeline.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-400">No timelines available.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <GlassButton type="button" variant="ghost" onClick={onClose} style={{ color: 'var(--text-primary)' }}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={!isFormValid}>
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