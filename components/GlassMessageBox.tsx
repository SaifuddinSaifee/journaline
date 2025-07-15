import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import {
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoHelpCircleOutline,
} from 'react-icons/io5';

type MessageVariant = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'help';

interface GlassMessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  variant?: MessageVariant;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showCloseButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  className?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  autoClose?: number; // Duration in milliseconds
}

const variants: Record<MessageVariant, {
  icon: React.ReactNode;
  buttonVariant: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  cardClassName: string;
}> = {
  info: {
    icon: <IoInformationCircleOutline className="w-6 h-6 text-blue-500" />,
    buttonVariant: 'primary',
    cardClassName: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    icon: <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />,
    buttonVariant: 'success',
    cardClassName: 'border-green-200 dark:border-green-800',
  },
  warning: {
    icon: <IoWarningOutline className="w-6 h-6 text-yellow-500" />,
    buttonVariant: 'warning',
    cardClassName: 'border-yellow-200 dark:border-yellow-800',
  },
  error: {
    icon: <IoAlertCircleOutline className="w-6 h-6 text-red-500" />,
    buttonVariant: 'error',
    cardClassName: 'border-red-200 dark:border-red-800',
  },
  confirm: {
    icon: <IoHelpCircleOutline className="w-6 h-6 text-purple-500" />,
    buttonVariant: 'primary',
    cardClassName: 'border-purple-200 dark:border-purple-800',
  },
  help: {
    icon: <IoHelpCircleOutline className="w-6 h-6 text-indigo-500" />,
    buttonVariant: 'secondary',
    cardClassName: 'border-indigo-200 dark:border-indigo-800',
  },
};

const sizes = {
  sm: {
    width: 'max-w-sm',
    padding: 'p-4',
    titleSize: 'text-base',
    messageSize: 'text-sm',
  },
  md: {
    width: 'max-w-md',
    padding: 'p-6',
    titleSize: 'text-lg',
    messageSize: 'text-base',
  },
  lg: {
    width: 'max-w-lg',
    padding: 'p-8',
    titleSize: 'text-xl',
    messageSize: 'text-lg',
  },
};

const GlassMessageBox: React.FC<GlassMessageBoxProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'info',
  size = 'md',
  showIcon = true,
  showCloseButton = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  className,
  actions,
  loading = false,
  autoClose,
}) => {
  const variantConfig = variants[variant];
  const sizeConfig = sizes[size];

  React.useEffect(() => {
    if (autoClose && isOpen && !loading) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className={cn(
            'relative z-50 w-full',
            sizeConfig.width,
            className
          )}
        >
          <GlassCard 
            variant="opaque"
            className={cn(
              sizeConfig.padding,
              'border-2',
              variantConfig.cardClassName
            )}
          >
            <div className="flex items-start gap-4">
              {showIcon && (
                <div className="flex-shrink-0 mt-1">
                  {variantConfig.icon}
                </div>
              )}
              <div className="flex-grow">
                <h3 className={cn(
                  'font-semibold text-text-primary mb-2',
                  sizeConfig.titleSize
                )}>
                  {title}
                </h3>
                <div className={cn(
                  'text-text-secondary mb-6 whitespace-pre-wrap',
                  sizeConfig.messageSize
                )}>
                  {message}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  {actions || (
                    <>
                      {(variant === 'confirm' || showCloseButton) && (
                        <GlassButton
                          variant="ghost"
                          size={size === 'lg' ? 'md' : 'sm'}
                          onClick={onClose}
                          disabled={loading}
                        >
                          {cancelText}
                        </GlassButton>
                      )}
                      <GlassButton
                        variant={variantConfig.buttonVariant}
                        size={size === 'lg' ? 'md' : 'sm'}
                        onClick={() => {
                          // Always call onConfirm if provided
                          if (onConfirm) {
                            onConfirm();
                          }
                          // Close the message box after action, unless loading
                          if (!loading) {
                            onClose();
                          }
                        }}
                        loading={loading}
                      >
                        {variant === 'confirm' ? confirmText : 'OK'}
                      </GlassButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlassMessageBox; 