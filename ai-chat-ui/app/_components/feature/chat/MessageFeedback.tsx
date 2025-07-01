'use client';

import React, { useState } from 'react';

interface MessageFeedbackProps {
  messageId: string;
  onFeedbackSubmit?: () => void;
}

export function MessageFeedback({ messageId, onFeedbackSubmit }: MessageFeedbackProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = async (helpful: boolean) => {
    if (submitted) return;

    if (!helpful) {
      setShowFeedbackForm(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bff/training/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatLogId: messageId, helpful }), // Use chatLogId instead of messageId
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setSubmitted(true);
      onFeedbackSubmit?.();
    } catch (error) {
      console.error('フィードバックの送信に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNegativeFeedback = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bff/training/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatLogId: messageId, // Use chatLogId instead of messageId
          helpful: false,
          feedback: feedbackText,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setSubmitted(true);
      setShowFeedbackForm(false);
      onFeedbackSubmit?.();
    } catch (error) {
      console.error('フィードバックの送信に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <div className="text-sm text-gray-500 mt-2">フィードバックを送信しました</div>;
  }

  return (
    <div className="mt-2">
      {!showFeedbackForm ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">この回答は役に立ちましたか？</span>
          <button
            onClick={() => handleFeedback(true)}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="役に立った"
          >
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4v4m-2-4v4m-2-4v4"
              />
            </svg>
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="役に立たなかった"
          >
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4v4m2-4v4m2-4v4"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          <p className="text-sm text-gray-600">改善のためのフィードバックをお聞かせください</p>
          <textarea
            placeholder="どのような点が不満でしたか？どのような回答を期待していましたか？"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitNegativeFeedback}
              disabled={isSubmitting || !feedbackText.trim()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
            <button
              onClick={() => {
                setShowFeedbackForm(false);
                setFeedbackText('');
              }}
              disabled={isSubmitting}
              className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
