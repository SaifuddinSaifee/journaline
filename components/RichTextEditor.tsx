'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import './RichTextEditor.css';
import { useEffect, useCallback } from 'react';
import MenuBar from './EditorMenuBar';
import LinkModal from './LinkModal';
import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
}: RichTextEditorProps) => {
  // Debounced onChange handler
  const debouncedOnChange = useCallback((html: string) => {
    // Skip if content hasn't actually changed
    if (html === value) return;
    onChange(html);
  }, [onChange, value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'rich-text-link',
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Use requestAnimationFrame to batch updates and prevent rapid firing
      requestAnimationFrame(() => {
        const html = editor.getHTML();
        debouncedOnChange(html);
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3 pt-0',
      },
    },
    // Add these options to handle SSR properly
    enableInputRules: false,
    enablePasteRules: false,
    immediatelyRender: false,
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const [showLinkModal, setShowLinkModal] = React.useState(false);

  const openLinkDialog = React.useCallback(() => {
    setShowLinkModal(true);
  }, []);

  const closeLinkDialog = () => setShowLinkModal(false);

  // Keyboard shortcut Ctrl/Cmd + K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openLinkDialog();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openLinkDialog]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('rich-text-editor rounded-lg border surface-elevated backdrop-blur-sm', className)}>
      <MenuBar editor={editor} onOpenLinkDialog={openLinkDialog} />
      <EditorContent editor={editor} />
      <LinkModal isOpen={showLinkModal} onClose={closeLinkDialog} editor={editor} />
    </div>
  );
};

export default RichTextEditor; 