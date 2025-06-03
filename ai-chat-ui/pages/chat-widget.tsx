import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface WidgetConfig {
  name: string;
  accentColor: string;
  logoUrl: string | null;
  isActive: boolean;
}

export default function ChatWidget() {
  const router = useRouter();
  const { widgetKey } = router.query;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (widgetKey) {
      fetchWidgetConfig();
      // Add welcome message
      setMessages([
        {
          id: '1',
          content: 'Hello! How can I help you today?',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [widgetKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Apply custom CSS variables for theming
    if (config) {
      document.documentElement.style.setProperty('--widget-accent', config.accentColor);
    }
  }, [config]);

  const fetchWidgetConfig = async () => {
    try {
      const response = await fetch(`/api/widgets/${widgetKey}`);
      if (response.ok) {
        const widgetConfig = await response.json();
        if (!widgetConfig.isActive) {
          setError('This chat widget is currently inactive.');
          return;
        }
        setConfig(widgetConfig);
      } else {
        setError('Widget not found or inactive.');
      }
    } catch (error) {
      console.error('Failed to fetch widget config:', error);
      setError('Failed to load chat widget.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/widget/${widgetKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.answer,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else if (response.status === 429) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Rate limit exceeded. Please try again later.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    // Send message to parent window about size change
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: isMinimized ? 'OPEN_WIDGET' : 'RESIZE_WIDGET',
          height: isMinimized ? 500 : 60,
        },
        '*'
      );
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-800 p-4">
        <div className="text-center">
          <div className="text-lg font-semibold">Chat Unavailable</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full bg-white ${isMinimized ? 'h-16' : 'h-full'}`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 text-white rounded-t-lg"
        style={{ backgroundColor: config.accentColor }}
      >
        <div className="flex items-center space-x-3">
          {config.logoUrl && (
            <img src={config.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          )}
          <div>
            <h3 className="font-semibold text-sm">{config.name}</h3>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>
        <button
          onClick={toggleMinimize}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${isMinimized ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: 'calc(100% - 120px)' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser ? 'text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{
                    backgroundColor: message.isUser ? config.accentColor : undefined,
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
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
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{
                  backgroundColor: config.accentColor,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
