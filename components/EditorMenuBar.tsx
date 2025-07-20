'use client';

import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeSLine,
  RiH1,
  RiH2,
  RiListUnordered,
  RiListOrdered,
  RiDoubleQuotesL,
  RiSeparator,
  RiLink,
  RiLinkUnlink,
} from 'react-icons/ri';

interface MenuBarProps {
  editor: Editor;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  const addLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className="border-b border-gray-200/20 flex flex-wrap gap-1 p-2">
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('bold') && 'bg-gray-500/30'
        )}
        title="Bold (Ctrl+B)"
      >
        <RiBold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('italic') && 'bg-gray-500/30'
        )}
        title="Italic (Ctrl+I)"
      >
        <RiItalic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleStrike().run())}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('strike') && 'bg-gray-500/30'
        )}
        title="Strikethrough"
      >
        <RiStrikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleCode().run())}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('code') && 'bg-gray-500/30'
        )}
        title="Code"
      >
        <RiCodeSLine className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200/20 mx-1 self-center" />
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('heading', { level: 1 }) && 'bg-gray-500/30'
        )}
        title="Heading 1"
      >
        <RiH1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('heading', { level: 2 }) && 'bg-gray-500/30'
        )}
        title="Heading 2"
      >
        <RiH2 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200/20 mx-1 self-center" />
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('bulletList') && 'bg-gray-500/30'
        )}
        title="Bullet List"
      >
        <RiListUnordered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleOrderedList().run())}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('orderedList') && 'bg-gray-500/30'
        )}
        title="Ordered List"
      >
        <RiListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200/20 mx-1 self-center" />
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBlockquote().run())}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('blockquote') && 'bg-gray-500/30'
        )}
        title="Blockquote"
      >
        <RiDoubleQuotesL className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setHorizontalRule().run())}
        className="p-1.5 rounded hover:bg-gray-500/20 transition-colors"
        title="Horizontal Rule"
      >
        <RiSeparator className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200/20 mx-1 self-center" />
      <button
        type="button"
        onClick={addLink}
        className={cn(
          'p-1.5 rounded hover:bg-gray-500/20 transition-colors',
          editor.isActive('link') && 'bg-gray-500/30'
        )}
        title="Add Link"
      >
        <RiLink className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleButtonClick(e, () => editor.chain().focus().unsetLink().run())}
        disabled={!editor.isActive('link')}
        className="p-1.5 rounded hover:bg-gray-500/20 transition-colors"
        title="Remove Link"
      >
        <RiLinkUnlink className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MenuBar; 