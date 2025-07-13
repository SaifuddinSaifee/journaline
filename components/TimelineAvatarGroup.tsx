"use client";

import React from "react";
import { Timeline } from "../lib/types";
import { cn } from "../lib/utils";
import GlassTooltip from "./GlassTooltip";
import Link from "next/link";

interface TimelineAvatarGroupProps {
  timelines: Timeline[];
  maxVisible?: number;
  size?: number;
}

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
    backgroundColor: color ?? "#3b82f6",
  });

  const tooltipContent = (
    <ol className="space-y-2 min-w-[16rem] list-none">
      {timelines
        .sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .map((t, index) => (
          <li key={t.id}>
            <Link
              href={`/timeline/${t.id}/edit`}
              className="flex items-center space-x-3 text-sm p-2 rounded-lg transition-all duration-200
                hover:bg-gray-100/80 dark:hover:bg-gray-800/80
                hover:shadow-md dark:hover:shadow-gray-900/30
                hover:scale-[1.02] hover:-translate-y-[1px]
                active:scale-[0.98] active:translate-y-0
                group
                dark:border dark:border-gray-800 dark:hover:border-gray-700/80"
            >
              <div
                className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: t.color ?? "#3b82f6", color: "#fff" }}
              >
                {index + 1}
              </div>
              <span 
                className="break-words flex-grow text-gray-900 dark:text-gray-100
                  group-hover:text-gray-900 dark:group-hover:text-white
                  transition-colors duration-200"
              >
                {t.name}
              </span>
            </Link>
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