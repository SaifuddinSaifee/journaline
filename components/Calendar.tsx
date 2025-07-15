'use client';

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { cn } from '../lib/utils';
import GlassButton from './GlassButton';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { IoAdd } from 'react-icons/io5';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function Calendar({ selectedDate, onDateSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  // Get the first day of the current month
  const monthStart = startOfMonth(currentMonth);
  // Get the last day of the current month
  const monthEnd = endOfMonth(currentMonth);
  // Get the start of the first week (Sunday)
  const calendarStart = startOfWeek(monthStart);
  // Get the end of the last week
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days including padding days
  const calendarDays = eachDayOfInterval({ 
    start: calendarStart,
    end: calendarEnd 
  });
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleAddEvent = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    onDateSelect(today);
  };

  return (
    <div className={cn('p-4', className)}>
      {/* Add Event Button */}
      <GlassButton
        variant="ghost"
        size="sm"
        onClick={handleAddEvent}
        className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
      >
        <IoAdd className="w-5 h-5" />
        Add Event
      </GlassButton>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="w-10 h-10 p-0"
            >
              <IoChevronBack className="w-6 h-6" />
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="w-10 h-10 p-0"
            >
              <IoChevronForward className="w-6 h-6" />
            </GlassButton>
          </div>
        </div>
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
        {calendarDays.map((day) => {
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
                isCurrentMonth ? 'text-text-primary font-medium' : 'text-text-muted opacity-40',
                !isCurrentMonth && 'hover:opacity-60',
                
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