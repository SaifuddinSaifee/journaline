'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCalendarOutline, IoCheckmarkCircle } from 'react-icons/io5';
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
  const isHoveringDropZone = dragState.isHoveringDropZone;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed pointer-events-none z-[100]"
        style={{
          left: mousePosition.x - 120, // Offset to center the card on cursor
          top: mousePosition.y - 60,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isHoveringDropZone ? 1.1 : 1, 
          opacity: 1,
          rotate: isHoveringDropZone ? 2 : 0,
        }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ 
          duration: 0.2,
          type: "spring",
          stiffness: 300,
          damping: 25 
        }}
      >
        <motion.div 
          className={`w-60 p-3 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-200 ${
            isHoveringDropZone 
              ? 'border-green-400/70 bg-green-50/95 dark:bg-green-900/80 ring-2 ring-green-400/50' 
              : 'border-blue-300/50 dark:border-blue-600/50 bg-white/90 dark:bg-gray-800/90'
          }`}
          animate={{
            y: isHoveringDropZone ? [0, -5, 0] : 0,
          }}
          transition={{
            y: {
              repeat: isHoveringDropZone ? Infinity : 0,
              duration: 1.5,
              ease: "easeInOut"
            }
          }}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium truncate transition-colors duration-200 ${
                isHoveringDropZone ? 'text-green-800 dark:text-green-200' : 'text-text-primary'
              }`}>
                {event.title}
              </h4>
              <p className={`text-xs mt-1 line-clamp-2 transition-colors duration-200 ${
                isHoveringDropZone ? 'text-green-700 dark:text-green-300' : 'text-text-secondary'
              }`}>
                {event.description}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <IoCalendarOutline className={`w-3 h-3 transition-colors duration-200 ${
                  isHoveringDropZone ? 'text-green-600 dark:text-green-400' : 'text-text-muted'
                }`} />
                <span className={`text-xs transition-colors duration-200 ${
                  isHoveringDropZone ? 'text-green-600 dark:text-green-400' : 'text-text-muted'
                }`}>
                  {format(eventDate, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex-shrink-0">
              {isHoveringDropZone ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </div>
          </div>
          
          <div className={`mt-2 text-xs flex items-center gap-1 transition-colors duration-200 ${
            isHoveringDropZone 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            <span>•</span>
            <span>
              {isHoveringDropZone ? 'Release to add to timeline' : 'Drag to timeline to add'}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default DragOverlay; 