import { useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { api } from '@/lib/api';

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    const { data } = await api.post<{ answer: string }>('/chat', { message });

    if (data?.answer) {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="min-h-[400px] border rounded p-4 overflow-y-auto">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} role={m.role} content={m.content} />
        ))}
        {loading && <div className="mt-2">Loading...</div>}
      </div>
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
