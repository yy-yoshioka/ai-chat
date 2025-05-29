import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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
    setLoading(true);

    try {
      const { data } = await api.post<{ answer: string }>('/chat', { message });

      if (data?.answer) {
        const assistantMessage: ChatMessageItem = {
          role: 'assistant',
          content: data.answer,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/faq"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline">プロフィール</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 lg:p-6 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-base sm:text-lg font-semibold">AI アシスタント</h2>
                <p className="text-blue-100 text-xs sm:text-sm">オンライン</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 chat-scroll">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">会話を始めましょう</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  何でもお気軽にお尋ねください。AIアシスタントがあなたの質問にお答えします。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  <button
                    onClick={() => sendMessage('今日の天気はどうですか？')}
                    className="p-4 text-sm bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                  >
                    <div className="font-medium text-gray-900">今日の天気はどうですか？</div>
                    <div className="text-xs text-gray-500 mt-1">天気について聞いてみる</div>
                  </button>
                  <button
                    onClick={() => sendMessage('プログラミングについて教えて')}
                    className="p-4 text-sm bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                  >
                    <div className="font-medium text-gray-900">プログラミングについて教えて</div>
                    <div className="text-xs text-gray-500 mt-1">技術的な質問をする</div>
                  </button>
                  <button
                    onClick={() => sendMessage('おすすめの本はありますか？')}
                    className="p-4 text-sm bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                  >
                    <div className="font-medium text-gray-900">おすすめの本はありますか？</div>
                    <div className="text-xs text-gray-500 mt-1">読書の相談をする</div>
                  </button>
                  <button
                    onClick={() => sendMessage('料理のレシピを教えて')}
                    className="p-4 text-sm bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                  >
                    <div className="font-medium text-gray-900">料理のレシピを教えて</div>
                    <div className="text-xs text-gray-500 mt-1">料理について聞く</div>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, idx) => (
              <ChatMessage key={idx} {...message} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm">入力中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
