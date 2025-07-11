'use client';

import React, { useState } from 'react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import { IoCalendarOutline, IoChevronDown, IoCloseCircle } from 'react-icons/io5';
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
    if (!dateRange.startDate || !dateRange.endDate) return null;
    
    return presets.find(preset => {
      const presetRange = preset.getRange();
      return (
        presetRange.startDate?.getTime() === dateRange.startDate?.getTime() &&
        presetRange.endDate?.getTime() === dateRange.endDate?.getTime()
      );
    });
  };

  return (
    <div className={cn('relative', className)}>
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

      {/* Clear Button */}
      {(dateRange.startDate || dateRange.endDate) && (
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={handleClearRange}
          className="ml-2 p-1 w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Clear date range"
        >
          <IoCloseCircle className="w-4 h-4" />
        </GlassButton>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-80">
          <GlassCard variant="default" className="p-4 shadow-xl">
            <div className="space-y-4">
              {/* Preset Ranges */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Quick Select</h3>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset) => {
                    const isActive = getActivePreset()?.value === preset.value;
                    return (
                      <button
                        key={preset.value}
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          'hover:bg-gray-100 dark:hover:bg-gray-800',
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                            : 'text-text-secondary'
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                          'w-full px-3 py-2 text-sm rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                          'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                          'text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50',
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
                          'w-full px-3 py-2 text-sm rounded-lg border border-gray-300/30 dark:border-gray-600/30',
                          'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm',
                          'text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                          'transition-all duration-200'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      onClick={handleCustomDateApply}
                      disabled={!customStartDate || !customEndDate}
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
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default DateRangeSelector; 