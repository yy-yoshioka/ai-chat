'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFAQPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    // Sample FAQ data
    const sampleFAQs: FAQ[] = [
      {
        id: '1',
        question: 'サービスの料金プランについて教えてください',
        answer: '当サービスでは、Freeプラン、Proプラン、Enterpriseプランをご用意しています。',
        category: '料金',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
      },
      {
        id: '2',
        question: 'ログインできない場合の対処方法は？',
        answer: 'パスワードリセット機能をご利用いただくか、サポートまでお問い合わせください。',
        category: 'テクニカルサポート',
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
      },
      {
        id: '3',
        question: 'データの削除方法について',
        answer: '設定画面からアカウント削除を行うことができます。',
        category: 'アカウント',
        isActive: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
    ];

    setTimeout(() => {
      setFaqs(sampleFAQs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredFAQs = faqs.filter((faq) => {
    return categoryFilter === 'all' || faq.category === categoryFilter;
  });

  const categories = ['all', ...Array.from(new Set(faqs.map((faq) => faq.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">FAQ管理</h1>
        <Link
          href={`/admin/${orgId}/faq/create`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新しいFAQを作成
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリフィルター</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'すべて' : category}
            </option>
          ))}
        </select>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">FAQ一覧 ({filteredFAQs.length}件)</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {faq.category}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {faq.isActive ? 'アクティブ' : '非アクティブ'}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    作成: {new Date(faq.createdAt).toLocaleDateString('ja-JP')} | 更新:{' '}
                    {new Date(faq.updatedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <Link
                    href={`/admin/${orgId}/faq/${faq.id}`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    編集
                  </Link>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
