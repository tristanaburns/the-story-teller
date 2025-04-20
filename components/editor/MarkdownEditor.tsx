'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bold, Italic, Link, List, ListOrdered, Image, Code, Heading1, Heading2, Heading3, Undo, Redo, Eye, EyeOff } from 'lucide-react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
}

export default function MarkdownEditor({
  initialValue = '',
  onChange,
  onSave,
  placeholder = 'Start writing...',
  height = 'auto',
  minHeight = '300px',
  maxHeight = 'none',
  readOnly = false
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [html, setHtml] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([initialValue]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [currentStackIndex, setCurrentStackIndex] = useState(0);
  const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
  
  // Convert markdown to HTML for preview
  useEffect(() => {
    const processMarkdown = async () => {
      const result = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(markdown);
      
      setHtml(result.toString());
    };
    
    processMarkdown();
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(markdown);
    }
  }, [markdown, onChange]);
  
  // Push changes to undo stack when content changes
  useEffect(() => {
    const debouncedPushToStack = setTimeout(() => {
      if (markdown !== undoStack[currentStackIndex]) {
        // Truncate the undo stack at current position and add new state
        const newUndoStack = undoStack.slice(0, currentStackIndex + 1);
        newUndoStack.push(markdown);
        setUndoStack(newUndoStack);
        setCurrentStackIndex(newUndoStack.length - 1);
        setRedoStack([]);
      }
    }, 500);
    
    return () => clearTimeout(debouncedPushToStack);
  }, [markdown, undoStack, currentStackIndex]);
  
  // Undo function
  const undo = useCallback(() => {
    if (currentStackIndex > 0) {
      const newIndex = currentStackIndex - 1;
      setCurrentStackIndex(newIndex);
      setMarkdown(undoStack[newIndex]);
      setRedoStack([...redoStack, undoStack[currentStackIndex]]);
    }
  }, [currentStackIndex, undoStack, redoStack]);
  
  // Redo function
  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const newState = redoStack[redoStack.length - 1];
      setMarkdown(newState);
      setUndoStack([...undoStack, newState]);
      setCurrentStackIndex(currentStackIndex + 1);
      setRedoStack(redoStack.slice(0, -1));
    }
  }, [currentStackIndex, undoStack, redoStack]);
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Check for common keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
  
  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };
  
  // Insert markdown syntax at cursor position
  const insertMarkdown = (syntax: string, placeholder = '', surroundSelection = true) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const selectedText = textarea.value.substring(selectionStart, selectionEnd);
      
      let newText = '';
      let newCursorPosition = 0;
      
      if (surroundSelection && selectedText) {
        // If text is selected, surround it with syntax
        newText = textarea.value.substring(0, selectionStart) +
                  syntax.replace(placeholder, selectedText) +
                  textarea.value.substring(selectionEnd);
        newCursorPosition = selectionStart + syntax.replace(placeholder, selectedText).length;
      } else {
        // If no text is selected, insert syntax with placeholder
        newText = textarea.value.substring(0, selectionStart) +
                  syntax +
                  textarea.value.substring(selectionEnd);
        newCursorPosition = selectionStart + syntax.indexOf(placeholder) + placeholder.length;
      }
      
      setMarkdown(newText);
      
      // Set focus back to textarea and restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };
  
  // Toolbar button actions
  const addHeading1 = () => insertMarkdown('# heading', 'heading');
  const addHeading2 = () => insertMarkdown('## heading', 'heading');
  const addHeading3 = () => insertMarkdown('### heading', 'heading');
  const addBold = () => insertMarkdown('**text**', 'text');
  const addItalic = () => insertMarkdown('*text*', 'text');
  const addLink = () => insertMarkdown('[text](url)', 'text');
  const addImage = () => insertMarkdown('![alt text](image-url)', 'alt text');
  const addUnorderedList = () => insertMarkdown('- list item\n- another item', 'list item');
  const addOrderedList = () => insertMarkdown('1. list item\n2. another item', 'list item');
  const addCode = () => insertMarkdown('```\ncode\n```', 'code');
  
  // Toggle preview mode
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  
  return (
    <div className="w-full border border-gray-700 rounded-lg overflow-hidden flex flex-col bg-gray-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-800 border-b border-gray-700">
        <button
          type="button"
          onClick={addHeading1}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={addHeading2}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={addHeading3}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
        <div className="h-6 border-r border-gray-600 mx-1"></div>
        <button
          type="button"
          onClick={addBold}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={addItalic}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <div className="h-6 border-r border-gray-600 mx-1"></div>
        <button
          type="button"
          onClick={addLink}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Link"
        >
          <Link size={18} />
        </button>
        <button
          type="button"
          onClick={addImage}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Image"
        >
          <Image size={18} />
        </button>
        <div className="h-6 border-r border-gray-600 mx-1"></div>
        <button
          type="button"
          onClick={addUnorderedList}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={addOrderedList}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          type="button"
          onClick={addCode}
          disabled={readOnly}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          title="Code Block"
        >
          <Code size={18} />
        </button>
        <div className="h-6 border-r border-gray-600 mx-1"></div>
        <button
          type="button"
          onClick={undo}
          disabled={currentStackIndex === 0 || readOnly}
          className={`p-2 rounded ${currentStackIndex === 0 ? 'text-gray-600' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={redoStack.length === 0 || readOnly}
          className={`p-2 rounded ${redoStack.length === 0 ? 'text-gray-600' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          title="Redo"
        >
          <Redo size={18} />
        </button>
        <div className="flex-grow"></div>
        <button
          type="button"
          onClick={togglePreview}
          className="flex items-center px-3 py-1 gap-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
        >
          {isPreviewMode ? (
            <>
              <EyeOff size={16} />
              <span className="text-sm">Edit</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span className="text-sm">Preview</span>
            </>
          )}
        </button>
      </div>
      
      {/* Editor/Preview Area */}
      <div className="flex-grow relative">
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${isPreviewMode ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
          style={{ 
            minHeight: minHeight,
            maxHeight: maxHeight,
            height: height 
          }}
        >
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={handleTextChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full h-full resize-none p-4 bg-gray-900 text-white font-mono text-sm focus:outline-none"
            style={{ 
              minHeight: minHeight,
              maxHeight: maxHeight,
              height: height 
            }}
          />
        </div>
        
        <div
          className={`absolute inset-0 transition-opacity duration-200 prose prose-invert max-w-none p-4 overflow-auto ${isPreviewMode ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          style={{ 
            minHeight: minHeight,
            maxHeight: maxHeight,
            height: height 
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        >
          <img 
            src="/icons/markdown-syntax.svg"
            className="max-w-full h-auto opacity-90 hover:opacity-100 transition-opacity" 
            alt="Markdown syntax reference"
          />
        </div>
      </div>
    </div>
  );
}
