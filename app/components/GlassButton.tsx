import React from 'react';
import { cn } from '../lib/utils';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variants = {
  default: 'glass hover:glass-strong text-text-on-glass',
  primary: 'glass-primary hover:bg-glass-primary-strong text-text-on-glass border-glass-primary-border',
  secondary: 'glass-secondary hover:bg-glass-secondary-strong text-text-on-glass border-glass-secondary-border',
  accent: 'glass-accent hover:bg-glass-accent-strong text-text-on-glass border-glass-accent-border',
  success: 'glass-success hover:bg-glass-success-strong text-text-on-glass border-glass-success-border',
  warning: 'glass-warning hover:bg-glass-warning-strong text-text-on-glass border-glass-warning-border',
  error: 'glass-error hover:bg-glass-error-strong text-text-on-glass border-glass-error-border',
  ghost: 'bg-transparent hover:glass border-transparent text-text-primary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: GlassButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-glass-primary-border focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        sizes[size],
        'rounded-xl',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && iconPosition === 'left' && !loading && icon}
      {children}
      {icon && iconPosition === 'right' && !loading && icon}
    </button>
  );
}

export default GlassButton; 