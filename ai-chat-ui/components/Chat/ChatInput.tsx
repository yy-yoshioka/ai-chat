import { useState, KeyboardEvent, useEffect, useRef } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to expand as needed
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Reset height when value is cleared
  useEffect(() => {
    if (!value && textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  }, [value]);

  return (
    <div className="relative flex items-end">
      <div className="flex-1 relative bg-white border border-gray-300 rounded-2xl shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:border-gray-400">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent px-4 py-3.5 pr-14 resize-none focus:outline-none text-gray-900 placeholder-gray-500 leading-relaxed rounded-2xl"
          rows={1}
          placeholder={disabled ? 'AIが応答中...' : 'メッセージを入力して下さい'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{
            minHeight: '56px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        />

        {/* Send button inside textarea */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={`
            absolute right-2 bottom-2.5 p-2 rounded-lg transition-all duration-200
            ${
              !value.trim() || disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-900'
            }
          `}
        >
          {disabled ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
