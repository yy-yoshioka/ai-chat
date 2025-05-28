import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import FAQForm, { FAQFormValues } from '@/components/FAQ/FAQForm';
import { api } from '@/lib/api';

export default function EditFAQPage() {
  const router = useRouter();
  const { id } = router.query;
  const [initialValues, setInitialValues] = useState<FAQFormValues>();

  useEffect(() => {
    if (!id) return;
    const fetchFaq = async () => {
      const { data } = await api.get<{ faq: FAQFormValues }>(`/faqs/${id}`);
      if (data?.faq) setInitialValues(data.faq);
    };
    fetchFaq();
  }, [id]);

  return (
    <AuthGuard>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit FAQ</h1>
        {initialValues ? (
          <FAQForm
            initialValues={initialValues}
            faqId={id as string}
            onSubmitSuccess={() => router.push('/admin/faq')}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </AuthGuard>
  );
}
