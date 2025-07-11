'use client';

import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Event, Timeline } from '../lib/types';
import { eventService } from '../lib/eventService';
import { timelineService } from '../lib/timelineService';
import { IoClose } from 'react-icons/io5';

interface NewTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (timeline: Timeline) => void;
}

export default function NewTimelineModal({ isOpen, onClose, onCreated }: NewTimelineModalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await eventService.getAllEvents();
      if (error) {
        setError(error);
      } else if (data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [isOpen]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data, error } = await timelineService.createTimeline({ name: name.trim(), description: description.trim() });
    if (error || !data) {
      alert(error || 'Failed to create timeline');
      setSaving(false);
      return;
    }
    // Update chosen events to include this timeline id
    const timelineId = data.id;
    for (const evt of events) {
      if (selectedIds.has(evt.id)) {
        const newIds = evt.timelineIds.includes(timelineId) ? evt.timelineIds : [...evt.timelineIds, timelineId];
        await eventService.updateEvent(evt.id, { timelineIds: newIds });
      }
    }
    setSaving(false);
    onCreated(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl animate-in zoom-in-95 duration-200">
        <GlassCard variant="strong" className="p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              New Timeline
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Timeline name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Timeline description (optional)"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Select Events</h3>
              {loading ? (
                <p className="text-text-secondary text-sm">Loading events...</p>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : events.length === 0 ? (
                <p className="text-text-secondary text-sm">No events available.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto border surface-elevated rounded-lg p-2 space-y-1">
                  {events.map(evt => (
                    <label key={evt.id} className="flex items-center space-x-2 text-sm cursor-pointer select-none" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(evt.id)}
                        onChange={() => toggleSelect(evt.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>{evt.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <GlassButton
              disabled={saving || !name.trim()}
              onClick={handleCreate}
              className="w-full"
            >
              {saving ? 'Creating...' : 'Create Timeline'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 