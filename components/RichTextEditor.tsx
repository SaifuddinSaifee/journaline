'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import './RichTextEditor.css';
import { useEffect, useCallback } from 'react';
import MenuBar from './EditorMenuBar';

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
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3',
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

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('rich-text-editor rounded-lg border surface-elevated backdrop-blur-sm', className)}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor; 