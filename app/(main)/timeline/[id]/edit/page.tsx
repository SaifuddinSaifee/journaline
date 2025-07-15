"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timeline as TimelineType } from "../../../../../lib/types";
import { timelineService } from "../../../../../lib/timelineService";
import { Timeline } from "../../../../../components/Timeline";
import GlassCard from "../../../../../components/GlassCard";
import GlassButton from "../../../../../components/GlassButton";
import MainLayout from "../../../../../components/MainLayout";
import { IoArrowBack, IoEyeOutline } from "react-icons/io5";
import Link from "next/link";

const DynamicTimelineEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const timelineId = typeof params.id === "string" ? params.id : "";

  const [timeline, setTimeline] = useState<TimelineType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } =
        await timelineService.getTimelineById(timelineId);

      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setTimeline(data);
      } else {
        setError("Timeline not found.");
      }
    } catch {
      setError("An unexpected error occurred while fetching the timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!timelineId) {
      setError("No timeline ID provided.");
      setLoading(false);
      return;
    }

    fetchTimelineData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineId]);

  const handleTimelineUpdate = (updatedTimeline: TimelineType) => {
    setTimeline(updatedTimeline);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <GlassCard hover={false}>
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <GlassButton
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <IoArrowBack className="mr-2" />
                Back
              </GlassButton>
              <Link href={`/timeline/${timelineId}/view`} target="_blank" passHref>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <IoEyeOutline className="mr-2" />
                  View
                </GlassButton>
              </Link>
            </div>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading timeline...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">
                <p>Error: {error}</p>
              </div>
            )}

            {!loading && !timeline && !error && (
              <div className="text-center py-8">
                <p className="text-text-secondary">No timeline data available.</p>
              </div>
            )}

            {!loading && !error && timeline && (
              <Timeline 
                timeline={timeline} 
                mode="edit" 
                onTimelineUpdate={handleTimelineUpdate}
              />
            )}
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
};

export default DynamicTimelineEditPage;
