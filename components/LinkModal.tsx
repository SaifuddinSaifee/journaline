"use client";

import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import GlassMessageBox from "./GlassMessageBox";
import GlassButton from "./GlassButton";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, editor }) => {
  const [href, setHref] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Prefill with existing link if active
      const previousUrl = editor.getAttributes("link").href ?? "";
      setHref(previousUrl || "");
      // Focus the input after opening
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isOpen, editor]);

  const handleConfirm = () => {
    if (!href || href === "") {
      // Remove link if empty or default placeholder
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    onClose();
  };

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  return (
    <GlassMessageBox
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Insert Link"
      message=""
      variant="confirm"
      actions={
        <div className="flex w-full flex-col gap-4">
          <input
            ref={inputRef}
            type="url"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="w-full px-3 py-2 rounded border surface-elevated focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
          <div className="flex justify-end gap-3">
            <GlassButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClose}
            >
              Cancel
            </GlassButton>
            {editor.isActive("link") && (
              <GlassButton
                variant="error"
                size="sm"
                type="button"
                onClick={handleRemove}
              >
                Remove Link
              </GlassButton>
            )}
            <GlassButton
              variant="primary"
              size="sm"
              type="button"
              onClick={handleConfirm}
            >
              {editor.isActive("link") ? "Update" : "Insert"}
            </GlassButton>
          </div>
        </div>
      }
      showIcon={false}
      showCloseButton={false}
    />
  );
};

export default LinkModal;
