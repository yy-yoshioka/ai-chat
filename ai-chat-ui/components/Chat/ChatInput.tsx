import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');

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

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          className="w-full border border-gray-300 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
          rows={1}
          placeholder={disabled ? 'AIが応答中...' : 'メッセージを入力してください...'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{
            minHeight: '44px',
            maxHeight: '120px',
            height: 'auto',
          }}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2 flex-shrink-0"
      >
        {disabled ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>送信中</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>送信</span>
          </>
        )}
      </button>
    </div>
  );
}
