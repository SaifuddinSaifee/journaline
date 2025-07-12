'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import GlassButton from './GlassButton';
import { IoSunny, IoMoon, IoDesktop } from 'react-icons/io5';

const SunIcon = () => <IoSunny className="w-4 h-4" />;
const MoonIcon = () => <IoMoon className="w-4 h-4" />;
const SystemIcon = () => <IoDesktop className="w-4 h-4" />;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: <SunIcon />, label: 'Light' },
    { value: 'dark' as const, icon: <MoonIcon />, label: 'Dark' },
    { value: 'system' as const, icon: <SystemIcon />, label: 'System' },
  ];

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