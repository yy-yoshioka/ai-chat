'use client';

import React, { useState } from 'react';
import { AlertCircle, Calendar, TrendingUp } from 'lucide-react';
// Simple component replacements
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useUnresolvedQuestions } from '@/app/_hooks/analytics/useAnalytics';
import { fetchPost } from '@/app/_utils/fetcher';

interface UnresolvedQuestionsProps {
  widgetId: string;
}

interface QuestionGroup {
  pattern: string;
  count: number;
  examples: Array<{
    question: string;
    feedback?: Array<{ feedback: string }>;
  }>;
  lastOccurrence: string;
}

function QuestionGroupItem({
  group,
  index,
  expanded,
  onToggle,
  onAddToFAQ,
}: {
  group: QuestionGroup;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onAddToFAQ: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              {group.count}回
            </span>
            <span className="text-sm text-gray-500">
              <Calendar className="h-3 w-3 inline mr-1" />
              最終:{' '}
              {formatDistanceToNow(new Date(group.lastOccurrence), {
                addSuffix: true,
                locale: ja,
              })}
            </span>
          </div>

          <p className="font-medium text-gray-900 mb-2">{group.pattern}</p>

          {expanded && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">類似の質問:</p>
              {group.examples.slice(1).map((example, i) => (
                <div key={i} className="pl-4 border-l-2 border-gray-200">
                  <p className="text-sm text-gray-700">{example.question}</p>
                  {example.feedback?.[0]?.feedback && (
                    <p className="text-xs text-gray-500 mt-1">
                      フィードバック: {example.feedback[0].feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {group.count > 1 && (
            <button
              className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              onClick={onToggle}
            >
              {expanded ? '閉じる' : '詳細'}
            </button>
          )}
          <button
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
            onClick={onAddToFAQ}
          >
            FAQに追加
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnresolvedQuestions({ widgetId }: UnresolvedQuestionsProps) {
  const { questions, isLoading, mutate } = useUnresolvedQuestions(widgetId);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  const addToFAQ = async (pattern: string) => {
    try {
      await fetchPost('/api/bff/faq', {
        widgetId,
        question: pattern,
        answer: '（回答を入力してください）',
        category: '未分類',
      });

      setToastMessage({ type: 'success', message: 'FAQに追加しました' });
      setTimeout(() => setToastMessage(null), 3000);

      mutate();
    } catch {
      setToastMessage({ type: 'error', message: 'FAQの追加に失敗しました' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-md text-white z-50 ${
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toastMessage.message}
        </div>
      )}
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          未解決の質問
        </h3>
      </div>
      <div className="p-6">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">未解決の質問はありません</div>
        ) : (
          <div className="space-y-4">
            {questions.map((group: QuestionGroup, index: number) => (
              <QuestionGroupItem
                key={index}
                group={group}
                index={index}
                expanded={expandedGroups.has(index)}
                onToggle={() => toggleExpanded(index)}
                onAddToFAQ={() => addToFAQ(group.pattern)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
