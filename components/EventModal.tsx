"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import GlassButton from "./GlassButton";
import GlassCard from "./GlassCard";
import GlassMessageBox from "./GlassMessageBox";
import { EventFormData, Timeline, Event } from "../lib/types";
import {
  IoClose,
  IoChevronDown,
  IoPencil,
  IoCalendarOutline,
  IoTrash,
} from "react-icons/io5";
import { MdTimeline } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import RichTextEditor from './RichTextEditor';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData, eventId?: string) => void;
  selectedDate: Date | null;
  event?: Event;
  allTimelines: Timeline[]; // Add this prop
  associatedTimelines?: Timeline[]; // Add this prop for existing events
  onDelete?: (eventId: string) => void; // Add this prop for deleting events
  initialMode?: 'view' | 'edit'; // Add this prop to control initial mode
}

// Local type that ensures date is required
type EventModalFormData = Omit<EventFormData, "date"> & {
  date: string;
};

export function EventModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  event,
  allTimelines,
  associatedTimelines = [], // Default to empty array if not provided
  onDelete,
  initialMode = 'view', // Default to view mode
}: EventModalProps) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<EventModalFormData>({
    title: "",
    description: "",
    timelineIds: [],
    date: selectedDate?.toISOString() || new Date().toISOString(),
    notes: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExitEditModeDialog, setShowExitEditModeDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData({
          title: event.title,
          description: event.description,
          timelineIds: event.timelineIds || [],
          date: event.date,
          notes: event.notes || "",
        });
        setIsEditMode(initialMode === 'edit'); // Use initialMode to set edit state
      } else {
        setFormData({
          title: "",
          description: "",
          timelineIds: [],
          date: selectedDate?.toISOString() || new Date().toISOString(),
          notes: "",
        });
        setIsEditMode(true); // New events always start in edit mode
      }
      setIsDirty(false);
    }
  }, [isOpen, event, selectedDate, initialMode]); // Add initialMode to dependencies

  const handleEditModeToggle = () => {
    if (isEditMode && isDirty) {
      setShowExitEditModeDialog(true);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleConfirmExitEditMode = () => {
    setShowExitEditModeDialog(false);
    // Reset form data to original event data
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        timelineIds: event.timelineIds || [],
        date: event.date,
        notes: event.notes || "",
      });
    }
    setIsEditMode(false);
    setIsDirty(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim() && formData.date) {
      await onSave(formData, event?.id);
      onClose();
    }
  };

  const handleInputChange = (
    field: keyof Omit<EventFormData, "timelineIds" | "date">,
    value: string
  ) => {
    // For title field, apply length limit
    if (field === "title") {
      const maxLength = 35;
      if (value.length > maxLength) return;
    }

    // For notes (rich text), skip if the content hasn't actually changed
    if (field === "notes" && value === formData.notes) return;

    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleTimelineSelection = (timelineId: string) => {
    setFormData((prev) => {
      const newTimelineIds = prev.timelineIds.includes(timelineId)
        ? prev.timelineIds.filter((id) => id !== timelineId)
        : [...prev.timelineIds, timelineId];
      return { ...prev, timelineIds: newTimelineIds };
    });
    setIsDirty(true);
  };

  const handleTimelineClick = (timelineId: string) => {
    if (!isEditMode) {
      router.push(`/timeline/${timelineId}/edit`);
    }
  };

  const handleClose = () => {
    if (isDirty && isEditMode) {
      setShowUnsavedChangesDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedChangesDialog(false);
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    if (event?.id) {
      onDelete?.(event.id);
      onClose(); // Close the modal after deleting
    }
  };

  const isFormValid =
    formData.title.trim() && formData.description.trim() && formData.date;

  if (!isOpen) return null;

  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      } satisfies Transition,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
          >
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
              variants={modalVariants}
            >
              <GlassCard
                variant="strong"
                className="shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Header Section */}
                <motion.div
                  className="flex items-center justify-between px-6 py-4 border-b border-gray-200/20"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    {isEditMode ? (
                      <motion.div
                        className="flex items-center gap-4 w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 35) {
                                handleInputChange("title", value);
                              }
                            }}
                            className="w-full text-xl font-semibold px-3 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                            placeholder="Event title..."
                            autoFocus
                          />
                          <span
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors",
                              formData.title.length > 30
                                ? "text-amber-500"
                                : "text-text-muted"
                            )}
                          >
                            {formData.title.length}/35
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.h2
                        className="text-xl font-semibold truncate py-2"
                        style={{ color: "var(--text-primary)" }}
                        layout
                      >
                        {event ? event.title : "Add Event"}
                      </motion.h2>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 pl-2 border-l border-gray-200/20 dark:border-gray-700/20">
                    {event && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GlassButton
                          type="button"
                          variant={isEditMode ? "ghost" : "primary"}
                          size="sm"
                          onClick={handleEditModeToggle}
                          className="w-10 h-10 p-0 transition-all duration-200"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <IoPencil className="w-5 h-5" />
                        </GlassButton>
                      </motion.div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="w-10 h-10 p-0"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <IoClose className="w-6 h-6" />
                      </GlassButton>
                    </motion.div>
                    {event && !isEditMode && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GlassButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleDelete}
                          className="w-10 h-10 p-0"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <IoTrash className="w-5 h-5 text-red-500" />
                        </GlassButton>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                  className="flex-1 overflow-y-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date Section */}
                    {(selectedDate || event) && (
                      <div className="flex items-center">
                        {isEditMode ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={formData.date.split("T")[0]}
                              onChange={(e) => {
                                const newDate = new Date(e.target.value);
                                newDate.setHours(12, 0, 0, 0);
                                setFormData((prev) => ({
                                  ...prev,
                                  date: newDate.toISOString(),
                                }));
                                setIsDirty(true);
                              }}
                              className="px-3 py-2 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                              style={{
                                color: "var(--text-primary)",
                                borderColor: "var(--glass-border)",
                                backgroundColor: "var(--surface-elevated)",
                              }}
                            />
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-500/10">
                            <IoCalendarOutline className="w-4 h-4 text-blue-400" />
                            <span
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {format(
                                selectedDate || new Date(event!.date),
                                "MMMM d, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description Section */}
                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Description
                        {isEditMode && (
                          <span
                            className="text-xs ml-2 px-2 py-1 bg-gray-500/10 rounded-full"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Markdown supported
                          </span>
                        )}
                      </label>
                      {isEditMode ? (
                        <div>
                          <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none min-h-[200px]"
                            style={{
                              color: "var(--text-primary)",
                              borderColor: "var(--glass-border)",
                              backgroundColor: "var(--surface-elevated)",
                            }}
                            placeholder="Enter event description..."
                            rows={8}
                          />
                          <div className="flex justify-end mt-2">
                            <span
                              className={cn(
                                "text-xs transition-colors",
                                formData.description.length > 200
                                  ? "text-amber-500"
                                  : "text-text-muted"
                              )}
                            >
                              {formData.description.length}/250
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert bg-gray-500/5 rounded-lg p-4">
                          <ReactMarkdown>{formData.description}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Notes Section - Add this after the Description Section */}
                    <div className="space-y-2">
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Notes
                        {isEditMode && (
                          <span
                            className="text-xs ml-2 px-2 py-1 bg-gray-500/10 rounded-full"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Rich text editor with formatting
                          </span>
                        )}
                      </label>
                      {isEditMode ? (
                        <div>
                          <RichTextEditor
                            value={formData.notes || ""}
                            onChange={(value) => handleInputChange("notes", value)}
                            placeholder="Add any additional notes or private details..."
                            className="w-full px-4 py-3 pt-0 rounded-lg border surface-elevated backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-h-[150px]"
                          />
                        </div>
                      ) : (
                        formData.notes ? (
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert bg-gray-500/5 rounded-lg p-4 rich-text-view"
                            dangerouslySetInnerHTML={{ __html: formData.notes }}
                          />
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-500/5 rounded-lg p-4">
                            No additional notes
                          </div>
                        )
                      )}
                    </div>

                    {/* Timelines Section */}
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Timelines
                      </label>
                      {isEditMode ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3 rounded-lg border surface-elevated backdrop-blur-sm flex justify-between items-center text-left transition-colors hover:border-blue-500/50"
                            style={{
                              color: "var(--text-primary)",
                              borderColor: "var(--glass-border)",
                              backgroundColor: "var(--surface-elevated)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <MdTimeline className="w-5 h-5 text-blue-400" />
                              <span>
                                {formData.timelineIds.length > 0
                                  ? `${formData.timelineIds.length} timeline(s) selected`
                                  : "Add to a timeline"}
                              </span>
                            </div>
                            <IoChevronDown
                              className={`transition-transform duration-200 ${
                                isDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isDropdownOpen && (
                            <div className="absolute w-full mt-2 bg-gray-800/90 backdrop-blur-lg border border-gray-700/50 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                              {allTimelines.length > 0 ? (
                                allTimelines.map((timeline) => (
                                  <label
                                    key={timeline.id}
                                    className="flex items-center px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.timelineIds.includes(
                                        timeline.id
                                      )}
                                      onChange={() =>
                                        handleTimelineSelection(timeline.id)
                                      }
                                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 border-gray-600 bg-gray-700"
                                    />
                                    <span className="ml-3 text-sm text-gray-200">
                                      {timeline.name}
                                    </span>
                                  </label>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-400">
                                  No timelines available.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {associatedTimelines.map((timeline) => (
                            <button
                              key={timeline.id}
                              onClick={() => handleTimelineClick(timeline.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30 transition-colors group"
                            >
                              <MdTimeline className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              {timeline.name}
                            </button>
                          ))}
                          {associatedTimelines.length === 0 && (
                            <span
                              className="text-sm px-3 py-2 bg-gray-500/10 rounded-full"
                              style={{ color: "var(--text-muted)" }}
                            >
                              No timelines selected
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.form>
                </motion.div>

                {/* Action Buttons */}
                {isEditMode && (
                  <motion.div
                    className="flex items-center px-6 py-4 border-t border-gray-200/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex-1">
                      {isDirty && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full whitespace-nowrap"
                        >
                          Unsaved changes
                        </motion.span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <GlassButton
                          type="button"
                          variant="ghost"
                          onClick={handleClose}
                          className="px-6"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Cancel
                        </GlassButton>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <GlassButton
                          type="submit"
                          variant="primary"
                          disabled={!isFormValid}
                          className={cn(
                            "px-6",
                            !isFormValid && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={handleSubmit}
                        >
                          {event ? "Save Changes" : "Create Event"}
                        </GlassButton>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>

            {/* Unsaved Changes Dialog */}
            <GlassMessageBox
              isOpen={showUnsavedChangesDialog}
              onClose={() => setShowUnsavedChangesDialog(false)}
              onConfirm={handleConfirmClose}
              title="Unsaved Changes"
              message="You have unsaved changes. Are you sure you want to close?"
              variant="confirm"
              confirmText="Close without saving"
              cancelText="Keep editing"
            />

            {/* Exit Edit Mode Dialog */}
            <GlassMessageBox
              isOpen={showExitEditModeDialog}
              onClose={() => setShowExitEditModeDialog(false)}
              onConfirm={handleConfirmExitEditMode}
              title="Exit Edit Mode"
              message="You have unsaved changes. Are you sure you want to exit edit mode? Your changes will be lost."
              variant="warning"
              confirmText="Exit without saving"
              cancelText="Keep editing"
            />

            {/* Delete Confirmation Dialog */}
            <GlassMessageBox
              isOpen={showDeleteDialog}
              onClose={() => setShowDeleteDialog(false)}
              onConfirm={handleConfirmDelete}
              title="Delete Event"
              message="Are you sure you want to delete this event? This action cannot be undone."
              variant="error"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EventModal;
