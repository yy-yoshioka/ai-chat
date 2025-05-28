import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue('');
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <textarea
        className="flex-1 border rounded p-2"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">
        Send
      </button>
    </div>
  );
}
