'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface CreateFAQProps {
  params: Promise<{ orgId: string }>;
}

export default function CreateFAQ({ params }: CreateFAQProps) {
  const router = useRouter();

  // Use React.use() to unwrap the params Promise
  const { orgId } = React.use(params);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      console.log('Creating FAQ:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect back to FAQ list
      router.push(`/admin/${orgId}/faq`);
    } catch (error) {
      console.error('Failed to create FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">FAQ作成</h1>
        <Link
          href={`/admin/${orgId}/faq`}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              質問
            </label>
            <input
              type="text"
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="質問を入力してください"
            />
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              回答
            </label>
            <textarea
              id="answer"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="回答を入力してください"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">カテゴリを選択</option>
              <option value="料金">料金</option>
              <option value="テクニカルサポート">テクニカルサポート</option>
              <option value="アカウント">アカウント</option>
              <option value="機能">機能</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              アクティブ
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href={`/admin/${orgId}/faq`}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '作成中...' : 'FAQ作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
