'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import GlassButton from './GlassButton';

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SystemIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: <SunIcon />, label: 'Light' },
    { value: 'dark' as const, icon: <MoonIcon />, label: 'Dark' },
    { value: 'system' as const, icon: <SystemIcon />, label: 'System' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];

  return (
    <div className="flex items-center gap-1 glass-subtle rounded-xl p-1">
      {themes.map((themeOption) => (
        <GlassButton
          key={themeOption.value}
          variant={theme === themeOption.value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme(themeOption.value)}
          className={`min-w-0 ${theme === themeOption.value ? '' : 'hover:glass-subtle'}`}
          aria-label={`Switch to ${themeOption.label} theme`}
          title={`Switch to ${themeOption.label} theme`}
        >
          {themeOption.icon}
          <span className="hidden sm:inline">{themeOption.label}</span>
        </GlassButton>
      ))}
    </div>
  );
}

export default ThemeToggle; 