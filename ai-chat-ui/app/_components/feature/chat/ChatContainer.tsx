import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useAuth } from '@/app/_hooks/auth/useAuth';

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
      const { data } = await api.post<{ answer: string; timestamp?: string }>('/chat', { message });

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
          <div className="flex-1 overflow-y-auto chat-scroll min-h-0">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">会話を始めましょう</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    何でもお気軽にお尋ねください。AIアシスタントがあなたの質問にお答えします。
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                    <button
                      onClick={() => sendMessage('今日の天気はどうですか？')}
                      className="group relative p-2.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 text-left hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">🌤️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-xs truncate">
                            今日の天気は
                          </div>
                          <div className="text-xs text-gray-500">天気について</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => sendMessage('プログラミングについて教えて')}
                      className="group relative p-2.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 text-left hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">💻</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-xs truncate">
                            プログラミング
                          </div>
                          <div className="text-xs text-gray-500">技術的質問</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => sendMessage('おすすめの本はありますか？')}
                      className="group relative p-2.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 text-left hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">📚</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-xs truncate">
                            おすすめ本
                          </div>
                          <div className="text-xs text-gray-500">読書相談</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => sendMessage('料理のレシピを教えて')}
                      className="group relative p-2.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 text-left hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">🍳</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-xs truncate">
                            料理レシピ
                          </div>
                          <div className="text-xs text-gray-500">料理について</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 lg:p-6 space-y-4">
                {messages.map((message, idx) => (
                  <ChatMessage
                    key={idx}
                    {...message}
                    user={message.role === 'user' ? user || undefined : undefined}
                  />
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-end gap-3 animate-fade-in">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-600"
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
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '150ms' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '300ms' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0 bg-white">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSend={sendMessage} disabled={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
