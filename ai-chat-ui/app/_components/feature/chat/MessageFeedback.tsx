'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchPost } from '@/app/_utils/fetcher';

interface MessageFeedbackProps {
  messageId: string;
  onFeedbackSubmit?: () => void;
}

interface FeedbackFormProps {
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function FeedbackForm({ onSubmit, onCancel, isSubmitting }: FeedbackFormProps) {
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;
    await onSubmit(feedbackText);
  };

  return (
    <div className="space-y-2 mt-2">
      <p className="text-sm text-gray-600">改善のためのフィードバックをお聞かせください</p>
      <Textarea
        placeholder="どのような点が不満でしたか？どのような回答を期待していましたか？"
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !feedbackText.trim()}>
          送信
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}

export function MessageFeedback({ messageId, onFeedbackSubmit }: MessageFeedbackProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (helpful: boolean, feedback?: string) => {
    setIsSubmitting(true);
    try {
      await fetchPost('/api/bff/training/feedback', {
        messageId,
        helpful,
        feedback,
      });
      setSubmitted(true);
      setShowFeedbackForm(false);
      onFeedbackSubmit?.();
      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePositiveFeedback = async () => {
    if (submitted) return;
    const success = await submitFeedback(true);
    if (success) {
      toast({
        title: 'フィードバックありがとうございます',
        description: 'より良いサービス提供に活用させていただきます',
      });
    } else {
      toast({
        title: 'エラー',
        description: 'フィードバックの送信に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleNegativeFeedback = async (feedback: string) => {
    const success = await submitFeedback(false, feedback);
    if (success) {
      toast({
        title: '貴重なご意見ありがとうございます',
        description: 'サービス改善の参考にさせていただきます',
      });
    } else {
      toast({
        title: 'エラー',
        description: 'フィードバックの送信に失敗しました',
        variant: 'destructive',
      });
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePositiveFeedback}
            disabled={isSubmitting}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeedbackForm(true)}
            disabled={isSubmitting}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <FeedbackForm
          onSubmit={handleNegativeFeedback}
          onCancel={() => {
            setShowFeedbackForm(false);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
