import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoClose,
} from "react-icons/io5";

export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const variants = {
  success: {
    icon: <IoCheckmarkCircleOutline className="w-5 h-5" />,
    className: "bg-green-500/20 text-green-500 border-green-500/30",
  },
  info: {
    icon: <IoInformationCircleOutline className="w-5 h-5" />,
    className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  },
  warning: {
    icon: <IoWarningOutline className="w-5 h-5" />,
    className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  },
  error: {
    icon: <IoAlertCircleOutline className="w-5 h-5" />,
    className: "bg-red-500/20 text-red-500 border-red-500/30",
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "success",
  isVisible,
  onClose,
  duration = 3000,
}) => {
  const variantConfig = variants[variant];

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 z-50"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-lg shadow-lg",
              variantConfig.className
            )}
          >
            <span className="flex-shrink-0">{variantConfig.icon}</span>
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <IoClose className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 