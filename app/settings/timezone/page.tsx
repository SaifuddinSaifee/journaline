'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';

// Common timezone options
const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'British Time (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)' },
  // Add more timezone options as needed
];

export default function TimezoneSettings() {
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual timezone saving logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      console.log('Saved timezone:', selectedTimezone);
    } catch (error) {
      console.error('Failed to save timezone:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Timezone Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred timezone for accurate event timing across the application.
        </p>
      </div>

      <GlassCard>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label 
              htmlFor="timezone" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Select Timezone
            </label>
            <select
              id="timezone"
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <GlassButton
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
} 