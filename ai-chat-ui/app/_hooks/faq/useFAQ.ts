import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FAQ } from '@/_schemas/faq';
import { FAQ_CONSTANTS } from '@/_config/faq/constants';

const mockFAQs: FAQ[] = [
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

export function useFAQ(orgId: string) {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs', orgId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, FAQ_CONSTANTS.LOADING_DELAY_MS));
      return mockFAQs;
    },
  });

  const deleteFAQ = useMutation({
    mutationFn: async (faqId: string) => {
      // TODO: Implement FAQ deletion
      console.log('Deleting FAQ:', faqId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs', orgId] });
    },
  });

  const filteredFAQs = faqs.filter((faq) => {
    return categoryFilter === 'all' || faq.category === categoryFilter;
  });

  const categories = ['all', ...Array.from(new Set(faqs.map((faq) => faq.category)))];

  return {
    faqs: filteredFAQs,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    categories,
    deleteFAQ: deleteFAQ.mutate,
  };
}
