import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Image as ImageIcon } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Write product description here...' }) => {
  const editorRef = useRef(null);

  // Sync editor content with external value (initial load or external reset)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const addImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-[#eae8d8] bg-[#fcfcfa] focus-within:border-[#729855] transition-colors rounded-none w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#fcfcfa] border-b border-[#eae8d8] select-none">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[#eae8d8] mx-1"></div>
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[#eae8d8] mx-1"></div>
        <button
          type="button"
          onClick={addLink}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 hover:bg-[#eae8d8]/50 text-gray-700 hover:text-black rounded-none cursor-pointer border-none flex items-center justify-center bg-transparent"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 font-body text-sm text-black focus:outline-none bg-transparent overflow-y-auto prose max-w-none"
        style={{ outline: 'none' }}
      />
    </div>
  );
};

export default RichTextEditor;
