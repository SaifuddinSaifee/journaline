'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { cn } from '../lib/utils';
import GlassButton from './GlassButton';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function Calendar({ selectedDate, onDateSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
  };

  return (
    <div className={cn('p-4', className)}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="w-8 h-8 p-0"
            >
              <IoChevronBack className="w-4 h-4" />
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="w-8 h-8 p-0"
            >
              <IoChevronForward className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
        
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="w-full mb-4"
        >
          Today
        </GlassButton>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-xs text-text-muted text-center py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                // Base styles
                'relative w-8 h-8 text-sm rounded-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
                'focus:ring-offset-white dark:focus:ring-offset-gray-900',
                'active:scale-95 transform',
                
                // Default state
                'hover:bg-white/40 dark:hover:bg-white/15',
                'hover:shadow-sm hover:scale-105',
                
                // Current month styling
                isCurrentMonth && 'text-text-primary font-medium',
                !isCurrentMonth && 'text-text-muted opacity-60',
                
                // Today styling (when not selected)
                isTodayDate && !isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-200 dark:ring-blue-700/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-semibold',
                
                // Selected state
                isSelected && 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 shadow-lg shadow-blue-500/25 ring-2 ring-blue-200 dark:ring-blue-400/50 font-semibold'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar; 