"use client";

import { useState, useEffect, useMemo } from "react";
import { Timeline } from "../../../lib/types";
import { timelineService } from "../../../lib/timelineService";
import GlassCard from "../../../components/GlassCard";
import GlassButton from "../../../components/GlassButton";
import NewTimelineModal from "../../../components/NewTimelineModal";
import { IoAdd, IoEyeOutline, IoPencil, IoTrashOutline, IoSearchOutline } from "react-icons/io5";
import Fuse from 'fuse.js';
import Link from "next/link";

export default function TimelinePage() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter timelines based on search term
  const filteredTimelines = useMemo(() => {
    if (!searchTerm.trim()) return timelines;
    const fuse = new Fuse(timelines, {
      keys: ['name', 'description'],
      threshold: 0.4,
    });
    return fuse.search(searchTerm).map(r => r.item);
  }, [timelines, searchTerm]);

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } =
          await timelineService.getAllTimelines();
        if (fetchError) {
          setError(fetchError);
        } else if (data) {
          setTimelines(data);
        }
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimelines();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this timeline? This action cannot be undone."
      )
    ) {
      const { error: deleteError } = await timelineService.deleteTimeline(id);
      if (deleteError) {
        alert(`Failed to delete timeline: ${deleteError}`);
      } else {
        setTimelines((prev) => prev.filter((t) => t.id !== id));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <GlassCard padding="none" hover={false}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-primary">
              My Timelines
            </h1>
            <GlassButton onClick={() => setIsModalOpen(true)}>
              <IoAdd className="mr-2" />
              New Timeline
            </GlassButton>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search timelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading timelines...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && timelines.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-text-primary mb-2">
                No timelines found.
              </h3>
              <p className="text-text-secondary">
                Get started by creating your first timeline.
              </p>
            </div>
          )}

          {!loading && !error && timelines.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTimelines.map((timeline) => (
                <GlassCard
                  padding="none"
                  key={timeline.id}
                  variant="subtle"
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-text-primary mb-2">
                        {timeline.name}
                      </h2>
                      <p className="text-text-secondary text-sm line-clamp-3">
                        {timeline.description || "No description provided."}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-end items-center gap-2">
                      <Link href={`/timeline/${timeline.id}/view`} passHref>
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <IoEyeOutline />
                        </GlassButton>
                      </Link>
                      <Link href={`/timeline/${timeline.id}/edit`} passHref>
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <IoPencil />
                        </GlassButton>
                      </Link>
                      <GlassButton
                        variant="error"
                        size="sm"
                        onClick={() => handleDelete(timeline.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <IoTrashOutline />
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <NewTimelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(timeline) => {
          setTimelines((prev) => [...prev, timeline]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
