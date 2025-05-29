interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
            : 'bg-gradient-to-r from-gray-400 to-gray-600'
        }`}
      >
        {isUser ? (
          <span className="text-white text-sm font-medium">U</span>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'items-end' : 'items-start'}`}
      >
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className={`mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
            <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
