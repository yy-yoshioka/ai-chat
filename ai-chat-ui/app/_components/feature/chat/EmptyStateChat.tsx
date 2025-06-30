interface QuickAction {
  id: string;
  text: string;
  prompt: string;
  emoji: string;
  color: string;
  category: string;
}

interface EmptyStateChatProps {
  onSendMessage: (message: string) => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'weather',
    text: '今日の天気は',
    prompt: '今日の天気はどうですか？',
    emoji: '🌤️',
    color: 'blue',
    category: '天気について',
  },
  {
    id: 'programming',
    text: 'プログラミング',
    prompt: 'プログラミングについて教えて',
    emoji: '💻',
    color: 'green',
    category: '技術的質問',
  },
  {
    id: 'books',
    text: 'おすすめ本',
    prompt: 'おすすめの本はありますか？',
    emoji: '📚',
    color: 'purple',
    category: '読書相談',
  },
  {
    id: 'cooking',
    text: '料理レシピ',
    prompt: '料理のレシピを教えて',
    emoji: '🍳',
    color: 'orange',
    category: '料理について',
  },
];

export default function EmptyStateChat({ onSendMessage }: EmptyStateChatProps) {
  return (
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
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSendMessage(action.prompt)}
              className="group relative p-2.5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 text-left hover:shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 bg-${action.color}-100 rounded-md flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-sm">{action.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-xs truncate">{action.text}</div>
                  <div className="text-xs text-gray-500">{action.category}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
