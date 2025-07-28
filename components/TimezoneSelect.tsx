'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { isFeatureEnabled } from '@/lib/featureFlags';
import type { GroupBase, StylesConfig } from 'react-select';
import type { Props as SelectProps } from 'react-select';
import type { TimezoneMapProps } from './TimezoneMap';

interface TimezoneOption {
  value: string;
  label: string;
  lat: number;
  lng: number;
}

// List of common timezones with their labels and coordinates
const timezoneData: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', lat: 0, lng: 0 },
  { value: 'America/New_York', label: 'Eastern Time (ET)', lat: 40.7128, lng: -74.0060 },
  { value: 'America/Chicago', label: 'Central Time (CT)', lat: 41.8781, lng: -87.6298 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', lat: 39.7392, lng: -104.9903 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', lat: 34.0522, lng: -118.2437 },
  { value: 'Europe/London', label: 'British Time (GMT/BST)', lat: 51.5074, lng: -0.1278 },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', lat: 48.8566, lng: 2.3522 },
  { value: 'Europe/Istanbul', label: 'Eastern European Time (EET)', lat: 41.0082, lng: 28.9784 },
  { value: 'Asia/Dubai', label: 'Gulf Time (GT)', lat: 25.2048, lng: 55.2708 },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', lat: 28.6139, lng: 77.2090 },
  { value: 'Asia/Shanghai', label: 'China Time (CT)', lat: 31.2304, lng: 121.4737 },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)', lat: 35.6762, lng: 139.6503 },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', lat: 1.3521, lng: 103.8198 },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', lat: -33.8688, lng: 151.2093 },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT)', lat: -36.8485, lng: 174.7633 },
];

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Dynamically import components to avoid SSR issues
const Select = dynamic<SelectProps<TimezoneOption, false, GroupBase<TimezoneOption>>>(() => 
  import('react-select'), { ssr: false }
);

const TimezoneMap = dynamic<TimezoneMapProps>(() => 
  import('./TimezoneMap'), { ssr: false }
);

export function TimezoneSelect({ value, onChange, className }: TimezoneSelectProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMapEnabled = isFeatureEnabled('interactiveTimezoneMap');
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const timezone = timezoneData.find(tz => tz.value === value) || timezoneData[0];
    return { lat: timezone.lat, lng: timezone.lng };
  });

  const selectedOption = timezoneData.find(tz => tz.value === value) || timezoneData[0];

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // Find the closest timezone based on coordinates
    const closest = timezoneData.reduce((prev, curr) => {
      const prevDist = Math.sqrt(
        Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2)
      );
      const currDist = Math.sqrt(
        Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2)
      );
      return prevDist < currDist ? prev : curr;
    });
    onChange(closest.value);
  };

  const selectStyles: StylesConfig<TimezoneOption, false, GroupBase<TimezoneOption>> = {
    control: (base) => ({
      ...base,
      backgroundColor: isDark ? 'rgb(31 41 55)' : 'white',
      borderColor: isDark ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
      '&:hover': {
        borderColor: isDark ? 'rgb(107 114 128)' : 'rgb(156 163 175)'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? 'rgb(31 41 55)' : 'white',
      border: `1px solid ${isDark ? 'rgb(75 85 99)' : 'rgb(209 213 219)'}`,
      position: 'relative',
      zIndex: 'auto'
    }),
    menuPortal: (base) => ({
      ...base,
      position: 'relative',
      zIndex: 1
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected 
        ? isDark ? 'rgb(59 130 246)' : 'rgb(59 130 246)'
        : isFocused
          ? isDark ? 'rgb(55 65 81)' : 'rgb(243 244 246)'
          : 'transparent',
      color: isSelected
        ? 'white'
        : isDark ? 'rgb(229 231 235)' : 'rgb(17 24 39)',
      ':active': {
        backgroundColor: isDark ? 'rgb(59 130 246)' : 'rgb(59 130 246)',
        color: 'white'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? 'rgb(229 231 235)' : 'rgb(17 24 39)'
    }),
    input: (base) => ({
      ...base,
      color: isDark ? 'rgb(229 231 235)' : 'rgb(17 24 39)'
    })
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Select
          value={selectedOption}
          onChange={(option) => {
            if (option) {
              onChange(option.value);
              setSelectedLocation({ lat: option.lat, lng: option.lng });
            }
          }}
          options={timezoneData}
          className={className}
          classNamePrefix="timezone-select"
          isSearchable
          instanceId="timezone-select"
          styles={selectStyles}
        />
      </div>

      {isMapEnabled && (
        <div className="relative">
          <React.Suspense fallback={<div className="h-[400px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
            <TimezoneMap
              selectedTimezone={value}
              onTimezoneChange={onChange}
              isDark={isDark}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
} 