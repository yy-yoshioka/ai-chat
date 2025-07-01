import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import EmptyStateChat from './EmptyStateChat';
import LoadingMessage from './LoadingMessage';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { useChatMessages } from '@/app/_hooks/chat/useChatMessages';

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function ChatContainer() {
  const { user } = useAuth();
  const { messages, messagesEndRef, sendMessage, isLoading } = useChatMessages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 lg:p-6 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
          <ChatHeader />

          <div className="flex-1 overflow-y-auto chat-scroll min-h-0">
            {messages.length === 0 ? (
              <EmptyStateChat onSendMessage={sendMessage} />
            ) : (
              <div className="p-3 sm:p-4 lg:p-6 space-y-4">
                {messages.map((message, idx) => (
                  <ChatMessage
                    key={idx}
                    {...message}
                    user={message.role === 'user' ? user || undefined : undefined}
                  />
                ))}

                {isLoading && <LoadingMessage />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0 bg-white">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSend={sendMessage} disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
