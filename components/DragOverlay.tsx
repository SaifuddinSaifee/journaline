'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { IoCalendarOutline } from 'react-icons/io5';
import { format } from 'date-fns';
import { useDrag } from './DragContext';

export function DragOverlay() {
  const { dragState } = useDrag();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = '';
    };
  }, [dragState.isDragging]);

  if (!dragState.isDragging || !dragState.draggedEvent) {
    return null;
  }

  const event = dragState.draggedEvent;
  const eventDate = new Date(event.date);

  return createPortal(
    <motion.div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: mousePosition.x - 120, // Offset to center the card on cursor
        top: mousePosition.y - 60,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="w-60 p-3 rounded-lg border border-blue-300/50 dark:border-blue-600/50 bg-white/90 dark:bg-gray-800/90 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary truncate">
              {event.title}
            </h4>
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">
              {event.description}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <IoCalendarOutline className="w-3 h-3 text-text-muted" />
              <span className="text-xs text-text-muted">
                {format(eventDate, 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <span>•</span>
          <span>Drag to timeline to add</span>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

export default DragOverlay; 