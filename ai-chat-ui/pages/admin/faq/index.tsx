import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import FAQItem, { FAQItemProps } from '@/components/FAQ/FAQItem';
import { api } from '@/lib/api';

export default function AdminFAQListPage() {
  const [faqs, setFaqs] = useState<FAQItemProps[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await api.get<{ faqs: FAQItemProps[] }>('/faqs');
      if (data?.faqs) {
        setFaqs(data.faqs);
      }
    };
    fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/faqs/${id}`);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Manage FAQs</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push('/admin/faq/create')}
        >
          New FAQ
        </button>
        {faqs.map((faq) => (
          <FAQItem
            key={faq.id}
            {...faq}
            onEdit={(id) => router.push(`/admin/faq/${id}`)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </AuthGuard>
  );
}
