import { useState, useRef, useEffect } from 'react';
import { ChatMessageItem } from '@/app/_components/feature/chat/ChatContainer';
import { useSendMessage } from '@/app/_hooks/chat/useChat';

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessageMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    const userMessage: ChatMessageItem = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendMessageMutation.mutateAsync(message);

      if (response?.answer) {
        const assistantMessage: ChatMessageItem = {
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessageItem = {
        role: 'assistant',
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return {
    messages,
    messagesEndRef,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
  };
}
