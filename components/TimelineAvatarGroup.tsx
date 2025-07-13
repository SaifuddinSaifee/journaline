"use client";

import React from "react";
import { Timeline } from "../lib/types";
import { cn } from "../lib/utils";
import GlassTooltip from "./GlassTooltip";

interface TimelineAvatarGroupProps {
  timelines: Timeline[];
  maxVisible?: number; // Number of avatars to show before "+N"
  size?: number; // Diameter of each avatar circle in pixels
}

// A small avatar group component that shows colored circles with the first letter of each timeline name.
// If more timelines exist than `maxVisible`, a "+N" circle is shown as the last avatar.
const TimelineAvatarGroup: React.FC<TimelineAvatarGroupProps> = ({
  timelines,
  maxVisible = 3,
  size = 24,
}) => {
  const visibleTimelines = timelines.slice(0, maxVisible);
  const remaining = timelines.length - maxVisible;

  const circleStyle = (color?: string) => ({
    width: size,
    height: size,
    backgroundColor: color ?? "#3b82f6", // Default to Tailwind's blue-500 if no color provided
  });

  // Build tooltip content – list every timeline name with colour chip
  const tooltipContent = (
    <ol className="space-y-2 min-w-[16rem] list-none">
      {timelines
        .sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .map((t, index) => (
          <li key={t.id} className="flex items-center space-x-3 text-sm">
            <div
              className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
              style={{ backgroundColor: t.color ?? "#3b82f6", color: "#fff" }}
            >
              {index + 1}
            </div>
            <span className="break-words flex-grow text-gray-900 dark:text-gray-100">
              {t.name}
            </span>
          </li>
        ))}
    </ol>
  );

  return (
    <GlassTooltip content={tooltipContent} position="top" width="20rem">
      <div className="flex items-center">
        {visibleTimelines.map((t, idx) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center justify-center rounded-full text-white text-xs font-semibold border-2 border-white dark:border-gray-900",
              idx === 0 ? "" : "-ml-2"
            )}
            style={circleStyle(t.color)}
          >
            {t.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-gray-400 text-white text-xs font-semibold border-2 border-white dark:border-gray-900",
              visibleTimelines.length > 0 ? "-ml-2" : ""
            )}
            style={{ width: size, height: size }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </GlassTooltip>
  );
};

export default TimelineAvatarGroup; 