import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'strong' | 'subtle' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'opaque';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
}

const variants = {
  default: 'glass',
  strong: 'glass-strong',
  subtle: 'glass-subtle',
  primary: 'glass-primary',
  secondary: 'glass-secondary',
  accent: 'glass-accent',
  success: 'glass-success',
  warning: 'glass-warning',
  error: 'glass-error',
  opaque: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const radiusClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
};

export function GlassCard({
  children,
  variant = 'default',
  className,
  hover = false,
  padding = 'md',
  radius = 'md',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        paddingClasses[padding],
        radiusClasses[radius],
        hover && 'hover:transform hover:-translate-y-0.5 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard; 