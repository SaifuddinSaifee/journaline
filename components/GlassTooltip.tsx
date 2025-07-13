"use client";

import React, { useState, useRef, useEffect } from "react";
import GlassCard from "./GlassCard";
import { cn } from "../lib/utils";

interface GlassTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  width?: string | number;
  maxHeight?: string;
  hideDelay?: number; // Delay in ms before hiding tooltip
}

const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  children,
  position = "top",
  width = "16rem",
  maxHeight = "max-h-60",
  hideDelay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative inline-block focus-within:outline-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute z-50 transition-opacity duration-200",
          !isVisible && "opacity-0 pointer-events-none",
          isVisible && "opacity-100",
          position === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
          position === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
          position === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
          position === "right" && "left-full top-1/2 -translate-y-1/2 ml-2"
        )}
        style={{ width }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <GlassCard 
          variant="opaque" 
          padding="sm" 
          radius="sm" 
          className={cn(
            "text-base overflow-y-auto whitespace-normal",
            maxHeight,
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          {content}
        </GlassCard>
      </div>
    </div>
  );
};

export default GlassTooltip; 