import { User } from '@/types/user';
import Image from 'next/image';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  user?: User;
}

export default function ChatMessage({ role, content, timestamp, user }: ChatMessageProps) {
  const isUser = role === 'user';

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const renderAvatar = () => {
    if (isUser) {
      if (user?.profileImage) {
        return (
          <Image
            src={user.profileImage}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              // フォールバック：画像読み込みエラー時はイニシャルを表示
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">${getUserInitials(user?.name)}</span>
                  </div>
                `;
              }
            }}
          />
        );
      } else {
        return (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">{getUserInitials(user?.name)}</span>
          </div>
        );
      }
    } else {
      return (
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
      );
    }
  };

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'order-2' : ''}`}>{renderAvatar()}</div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* User name (only for user messages) */}
        {isUser && user?.name && (
          <div className="px-2 mb-1">
            <span className="text-xs text-gray-500">{user.name}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
          } ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
        >
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className={`mt-1 px-2`}>
            <span className="text-xs text-gray-400">{formatTime(timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
