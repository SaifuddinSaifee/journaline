'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import SectionToggle from './SectionToggle';
import { IoSettingsOutline } from 'react-icons/io5';
import { cn } from '../lib/utils';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 h-16',
      'bg-white/95 dark:bg-slate-900/95',
      'backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/30',
      'shadow-sm dark:shadow-gray-900/20',
      className
    )}>
      <div className="flex items-center justify-between h-full px-6">
        {/* App Brand */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-text-primary">
            Journaline
          </h1>
        </div>

        {/* Center Section Toggle */}
        <div className="flex items-center">
          <SectionToggle />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            title="Settings"
          >
            <IoSettingsOutline className="w-5 h-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 