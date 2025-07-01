import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useEditFaq(orgId: string, faqId: string) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadFAQ = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample FAQ data
        const faq: FAQ = {
          id: faqId,
          question: 'サービスの料金プランについて教えてください',
          answer: '当サービスでは、Freeプラン、Proプラン、Enterpriseプランをご用意しています。',
          category: '料金',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
        };

        setFormData({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          isActive: faq.isActive,
        });
      } catch (error) {
        console.error('Failed to load FAQ:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFAQ();
  }, [faqId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: Replace with actual API call
      console.log('Updating FAQ:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect back to FAQ list
      router.push(`/admin/${orgId}/faq`);
    } catch (error) {
      console.error('Failed to update FAQ:', error);
    } finally {
      setSaving(false);
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

  return {
    formData,
    loading,
    saving,
    handleSubmit,
    handleChange,
  };
}
