import React from "react";
import { motion } from "framer-motion";

export type Grouping = "daily" | "weekly" | "monthly" | "yearly";

interface GroupBySelectorProps {
  value: Grouping;
  onChange: (val: Grouping) => void;
  className?: string;
}

const options: Grouping[] = ["daily", "weekly", "monthly", "yearly"];

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const GroupBySelector: React.FC<GroupBySelectorProps> = ({ value, onChange, className = "" }) => {
  return (
    <div
      className={`relative inline-flex rounded-full bg-gray-100 dark:bg-gray-800/50 p-1 ${className}`.trim()}
    >
      {options.map(option => {
        const isActive = option === value;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={
              `relative z-10 px-4 py-1 text-sm font-medium capitalize transition-colors duration-200 ` +
              (isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400")
            }
          >
            {isActive && (
              <motion.div
                layoutId="group-by-pill"
                className="absolute inset-0 rounded-full bg-white shadow-md dark:bg-gray-700"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative pointer-events-none">{capitalize(option)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default GroupBySelector; 