'use client';

import React, { useState } from 'react';
import { format, subDays, subMonths, startOfDay, endOfDay, isAfter } from 'date-fns';
import { IoCalendarOutline, IoChevronDown } from 'react-icons/io5';
import { cn } from '../lib/utils';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeSelector({ dateRange, onDateRangeChange, className }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const presets = [
    {
      label: 'Last 7 days',
      value: 'last7days',
      getRange: () => ({
        startDate: subDays(startOfDay(new Date()), 6),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: 'Last 30 days',
      value: 'last30days',
      getRange: () => ({
        startDate: subDays(startOfDay(new Date()), 29),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: 'Last 3 months',
      value: 'last3months',
      getRange: () => ({
        startDate: subMonths(startOfDay(new Date()), 3),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: 'Last 6 months',
      value: 'last6months',
      getRange: () => ({
        startDate: subMonths(startOfDay(new Date()), 6),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: 'Last year',
      value: 'lastyear',
      getRange: () => ({
        startDate: subMonths(startOfDay(new Date()), 12),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: 'All time',
      value: 'alltime',
      getRange: () => ({
        startDate: null,
        endDate: null,
      }),
    },
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = preset.getRange();
    onDateRangeChange(range);
    setIsOpen(false);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      // Validate dates
      if (isAfter(startDate, endDate)) {
        alert('Start date must be before end date');
        return;
      }
      
      onDateRangeChange({
        startDate: startOfDay(startDate),
        endDate: endOfDay(endDate),
      });
      setIsOpen(false);
    }
  };

  const handleClearRange = () => {
    onDateRangeChange({ startDate: null, endDate: null });
    setCustomStartDate('');
    setCustomEndDate('');
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    if (!range.startDate || !range.endDate) {
      return 'All time';
    }
    
    const start = format(range.startDate, 'MMM d, yyyy');
    const end = format(range.endDate, 'MMM d, yyyy');
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  const getActivePreset = () => {
    return presets.find(preset => {
      const presetRange = preset.getRange();
      
      // Handle "All time" case (both preset and current range have null values)
      if (!presetRange.startDate && !presetRange.endDate && !dateRange.startDate && !dateRange.endDate) {
        return true;
      }
      
      // Handle date range presets
      if (presetRange.startDate && presetRange.endDate && dateRange.startDate && dateRange.endDate) {
        return (
          presetRange.startDate.getTime() === dateRange.startDate.getTime() &&
          presetRange.endDate.getTime() === dateRange.endDate.getTime()
        );
      }
      
      return false;
    });
  };

  return (
    <div className={cn('relative z-[10000]', className)}>
      {/* Trigger Button */}
      <GlassButton
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center gap-2 text-sm"
      >
        <IoCalendarOutline className="w-4 h-4" />
        <span>{formatDateRange(dateRange)}</span>
        <IoChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '')} />
      </GlassButton>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-[10000] w-80 max-w-[calc(100vw-2rem)]">
          <GlassCard variant="default" className="p-4 shadow-xl backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/30">
            <div className="space-y-4">
              {/* Quick Select Pills */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Quick Select</h3>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => {
                    const isActive = getActivePreset()?.value === preset.value;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                          'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                          'border border-transparent',
                          'hover:scale-105 active:scale-95',
                          isActive 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-400' 
                            : 'bg-white/60 dark:bg-gray-700/60 text-text-secondary hover:bg-white/80 dark:hover:bg-gray-700/80 hover:text-text-primary border-gray-200/50 dark:border-gray-600/50'
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200/50 dark:border-gray-600/50"></div>

              {/* Custom Date Range */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Custom Range</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 text-sm rounded-lg border border-gray-300/50 dark:border-gray-600/50',
                          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
                          'text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                          'transition-all duration-200'
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 text-sm rounded-lg border border-gray-300/50 dark:border-gray-600/50',
                          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
                          'text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                          'transition-all duration-200'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={handleClearRange}
                      className="backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80"
                    >
                      Clear
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80"
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      onClick={handleCustomDateApply}
                      disabled={!customStartDate || !customEndDate}
                      className="backdrop-blur-sm"
                    >
                      Apply
                    </GlassButton>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default DateRangeSelector; 