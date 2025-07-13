'use client';

import React, { useState } from 'react';
import { IoChevronDown, IoSwapVerticalOutline } from 'react-icons/io5';
import { SortPreference, SortField, SortOrder } from '../lib/types';
import { cn } from '../lib/utils';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';

interface SortSelectorProps {
  value: SortPreference;
  onChange: (newValue: SortPreference) => void;
  onApply?: (value: SortPreference) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { field: 'date', label: 'Event Date', description: 'Sort by when events occurred' },
  { field: 'createdAt', label: 'Created Date', description: 'Sort by when events were created' },
  { field: 'updatedAt', label: 'Updated Date', description: 'Sort by when events were last modified' },
] as const;

const ORDER_OPTIONS = [
  { order: 'desc', label: 'Latest First', description: 'Show newest items at the top' },
  { order: 'asc', label: 'Oldest First', description: 'Show oldest items at the top' },
] as const;

export default function SortSelector({ value, onChange, onApply, className = '' }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState<SortPreference>(value);

  // Reset temp value when dropdown opens
  React.useEffect(() => {
    if (isOpen) {
      setTempValue(value);
    }
  }, [isOpen, value]);

  const handleOptionSelect = (field: SortField | undefined, order: SortOrder | undefined) => {
    const newValue = {
      field: field ?? tempValue.field,
      order: order ?? tempValue.order,
    };
    setTempValue(newValue);
    onChange(newValue);
  };

  const handleApply = () => {
    onApply?.(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    onChange(value); // Reset to original value
    setIsOpen(false);
  };

  const getCurrentFieldOption = () => {
    return SORT_OPTIONS.find(opt => opt.field === value.field);
  };

  const getCurrentOrderOption = () => {
    return ORDER_OPTIONS.find(opt => opt.order === value.order);
  };

  const formatCurrentSelection = () => {
    const field = getCurrentFieldOption()?.label || 'Sort by';
    const order = getCurrentOrderOption()?.label || '';
    return `${field} - ${order}`;
  };

  return (
    <div className={cn('relative z-[50]', className)}>
      {/* Trigger Button */}
      <GlassButton
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center gap-2 text-sm"
      >
        <IoSwapVerticalOutline className="w-4 h-4" />
        <span>{formatCurrentSelection()}</span>
        <IoChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '')} />
      </GlassButton>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-[51] w-80 max-w-[calc(100vw-2rem)]">
          <GlassCard variant="default" className="p-4 shadow-xl backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/30">
            <div className="space-y-4">
              {/* Sort By Field */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Sort By</h3>
                <div className="grid grid-cols-1 gap-2">
                  {SORT_OPTIONS.map((option) => {
                    const isActive = tempValue.field === option.field;
                    return (
                      <button
                        key={option.field}
                        onClick={() => handleOptionSelect(option.field, undefined)}
                        className={cn(
                          'px-4 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer',
                          'border',
                          'hover:scale-[1.02] active:scale-[0.98]',
                          isActive 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-400' 
                            : 'bg-white/60 dark:bg-gray-700/60 text-text-secondary hover:bg-white/80 dark:hover:bg-gray-700/80 hover:text-text-primary border-gray-200/50 dark:border-gray-600/50'
                        )}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className={cn(
                          'text-xs mt-1',
                          isActive ? 'text-blue-100' : 'text-text-muted'
                        )}>
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200/50 dark:border-gray-600/50"></div>

              {/* Order Direction */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Order</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ORDER_OPTIONS.map((option) => {
                    const isActive = tempValue.order === option.order;
                    return (
                      <button
                        key={option.order}
                        onClick={() => handleOptionSelect(undefined, option.order)}
                        className={cn(
                          'px-3 py-2 rounded-lg text-center transition-all duration-200 cursor-pointer',
                          'border',
                          'hover:scale-105 active:scale-95',
                          isActive 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-blue-400' 
                            : 'bg-white/60 dark:bg-gray-700/60 text-text-secondary hover:bg-white/80 dark:hover:bg-gray-700/80 hover:text-text-primary border-gray-200/50 dark:border-gray-600/50'
                        )}
                      >
                        <div className="font-medium">{option.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  className="backdrop-blur-sm"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  className="backdrop-blur-sm"
                >
                  Apply
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[49]"
          onClick={handleCancel}
        />
      )}
    </div>
  );
} 