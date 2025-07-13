"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Timeline as TimelineType } from '../../../../lib/types';
import { timelineService } from '../../../../lib/timelineService';
import { Timeline } from '../../../../components/Timeline';
import GlassCard from '../../../../components/GlassCard';

const DynamicTimelinePage = () => {
  const params = useParams();
  const timelineId = typeof params.id === 'string' ? params.id : '';
  
  const [timeline, setTimeline] = useState<TimelineType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!timelineId) {
      setError('No timeline ID provided.');
      setLoading(false);
      return;
    }

    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await timelineService.getTimelineById(timelineId);
        
        if (fetchError) {
          setError(fetchError);
        } else if (data) {
          setTimeline(data);
        } else {
          setError('Timeline not found.');
        }
      } catch {
        setError('An unexpected error occurred while fetching the timeline.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [timelineId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-text-secondary">Loading timeline...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard>
          <div className="flex items-center justify-center h-96">
            <p className="text-red-500">{error}</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!timeline) {
     return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <GlassCard>
          <div className="flex items-center justify-center h-96">
            <p className="text-text-secondary">No timeline data available.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  // The existing Timeline component will be refactored next to accept timeline data as props.
  // For now, this demonstrates that the data is being fetched correctly.
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <Timeline timeline={timeline} mode="view" />
    </div>
  );
};

export default DynamicTimelinePage; 