import React from 'react';
import Link from 'next/link';

interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

interface FaqFormProps {
  formData: FaqFormData;
  orgId: string;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

const categories = ['料金', 'テクニカルサポート', 'アカウント', '機能', 'その他'];

export default function FaqForm({ formData, orgId, saving, onSubmit, onChange }: FaqFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
          質問
        </label>
        <input
          type="text"
          id="question"
          name="question"
          value={formData.question}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">カテゴリを選択</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onChange}
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
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '保存中...' : 'FAQ保存'}
        </button>
      </div>
    </form>
  );
}
