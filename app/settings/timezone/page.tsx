'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { IoGlobeOutline, IoSaveOutline } from 'react-icons/io5';
import { TimezoneSelect } from '@/components/TimezoneSelect';
import { toast } from 'react-hot-toast';

export default function TimezoneSettings() {
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved timezone preference
  useEffect(() => {
    async function loadTimezone() {
      try {
        const response = await fetch('/api/settings/timezone');
        const data = await response.json();
        if (data.timezone) {
          setSelectedTimezone(data.timezone);
        }
      } catch (error) {
        console.error('Failed to load timezone:', error);
        toast.error('Failed to load timezone preference');
      } finally {
        setIsLoading(false);
      }
    }

    loadTimezone();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timezone: selectedTimezone }),
      });

      if (!response.ok) {
        throw new Error('Failed to save timezone');
      }

      toast.success('Timezone settings saved successfully');
    } catch (error) {
      console.error('Failed to save timezone:', error);
      toast.error('Failed to save timezone settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative pt-20 px-6 pb-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
          <GlassCard>
            <div className="p-6 space-y-6">
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-20 px-6 pb-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IoGlobeOutline className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Timezone Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred timezone for accurate event timing across the application.
        </p>
      </div>

      <GlassCard>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label 
              htmlFor="timezone" 
              className="block text-lg font-medium text-gray-700 dark:text-gray-300"
            >
              Select Timezone
            </label>
            <div className="space-y-2">
              <TimezoneSelect
                value={selectedTimezone}
                onChange={setSelectedTimezone}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <GlassButton
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <IoSaveOutline className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
} 