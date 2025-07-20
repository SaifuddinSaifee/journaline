'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Timeline } from '../lib/types';
import { timelineService } from '../lib/timelineService';
import { IoTimeOutline, IoPencil, IoAdd, IoSearchOutline } from 'react-icons/io5';
import Fuse from 'fuse.js';
import GlassButton from './GlassButton';

interface TimelineListProps {
  isCollapsed: boolean;
}

export function TimelineList({ isCollapsed }: TimelineListProps) {
  const router = useRouter();
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimelines();
  }, []);

  const loadTimelines = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await timelineService.getAllTimelines();
      if (fetchError) {
        setError(fetchError);
        setTimelines([]);
      } else if (data) {
        // Filter out archived timelines and limit to most recent ones
        const activeTimelines = data.filter(t => !t.isArchived).slice(0, 8);
        setTimelines(activeTimelines);
      }
    } catch (err) {
      console.error('Error loading timelines:', err);
      setError('Failed to load timelines');
      setTimelines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineClick = (timelineId: string) => {
    router.push(`/timeline/${timelineId}/edit`);
  };

  const handleCreateTimeline = () => {
    router.push('/timeline');
  };

  const filteredTimelines = useMemo(() => {
    if (!searchTerm.trim()) return timelines;
    const fuse = new Fuse(timelines, {
      keys: ['name', 'description'],
      threshold: 0.4,
    });
    return fuse.search(searchTerm).map(r => r.item);
  }, [timelines, searchTerm]);

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={handleCreateTimeline}
          className="w-full h-10 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary"
          title="Create new timeline"
        >
          <IoAdd className="w-5 h-5" />
        </GlassButton>
        {!loading && filteredTimelines.slice(0, 3).map((timeline) => (
          <GlassButton
            key={timeline.id}
            variant="ghost"
            size="sm"
            onClick={() => handleTimelineClick(timeline.id)}
            className="w-full h-10 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary"
            title={timeline.name}
          >
            <IoTimeOutline className="w-4 h-4" />
          </GlassButton>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Timelines</h3>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={handleCreateTimeline}
          className="h-6 w-6 p-0 flex items-center justify-center text-text-secondary hover:text-text-primary"
          title="Create new timeline"
        >
          <IoAdd className="w-4 h-4" />
        </GlassButton>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search timelines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 pl-8 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <IoSearchOutline className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-xs text-text-secondary mt-1">Loading...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-2">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && timelines.length === 0 && (
        <div className="text-center py-4">
          <IoTimeOutline className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-xs text-text-secondary">No timelines yet</p>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleCreateTimeline}
            className="mt-2 text-xs text-blue-500 hover:text-blue-600"
          >
            Create your first timeline
          </GlassButton>
        </div>
      )}

      {!loading && !error && timelines.length > 0 && (
        <div className="space-y-2 overflow-y-auto">
          {filteredTimelines.map((timeline) => (
            <button
              key={timeline.id}
              onClick={() => handleTimelineClick(timeline.id)}
              className="w-full text-left p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-50/90 dark:hover:bg-gray-700/70 shadow-sm hover:shadow-md transition-all duration-200 group backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {timeline.name}
                  </h4>
                  {timeline.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {timeline.description}
                    </p>
                  )}
                </div>
                <IoPencil className="w-3 h-3 text-text-muted group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimelineList; 