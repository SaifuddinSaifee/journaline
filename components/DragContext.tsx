'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DragContextType, DragState, DragEvent, Event } from '../lib/types';

const DragContext = createContext<DragContextType | undefined>(undefined);

interface DragProviderProps {
  children: ReactNode;
}

export function DragProvider({ children }: DragProviderProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEvent: null,
    dragOrigin: null,
    isHoveringDropZone: false,
    dragStartPosition: null,
  });

  const startDrag = (event: Event, origin: 'sidebar', startPosition?: { x: number; y: number }) => {
    const dragEvent: DragEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      timelineIds: event.timelineIds,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    setDragState({
      isDragging: true,
      draggedEvent: dragEvent,
      dragOrigin: origin,
      isHoveringDropZone: false,
      dragStartPosition: startPosition || null,
    });
  };

  const endDrag = () => {
    setDragState({
      isDragging: false,
      draggedEvent: null,
      dragOrigin: null,
      isHoveringDropZone: false,
      dragStartPosition: null,
    });
  };

  const setDraggedEvent = (event: DragEvent | null) => {
    setDragState(prev => ({
      ...prev,
      draggedEvent: event,
    }));
  };

  const setHoveringDropZone = (isHovering: boolean) => {
    setDragState(prev => ({
      ...prev,
      isHoveringDropZone: isHovering,
    }));
  };

  const value: DragContextType = {
    dragState,
    startDrag,
    endDrag,
    setDraggedEvent,
    setHoveringDropZone,
  };

  return (
    <DragContext.Provider value={value}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
}

export default DragContext; 