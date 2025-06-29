import { useState } from 'react';
import { useCreateFAQ, useUpdateFAQ } from '@/app/_hooks/faq/useFAQ';

export interface FAQFormValues {
  question: string;
  answer: string;
}

interface FAQFormProps {
  initialValues?: FAQFormValues;
  onSubmitSuccess?: () => void;
  faqId?: string;
}

export default function FAQForm({ initialValues, onSubmitSuccess, faqId }: FAQFormProps) {
  const [values, setValues] = useState<FAQFormValues>(
    initialValues || { question: '', answer: '' }
  );
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (faqId) {
        await updateFAQ.mutateAsync({
          id: faqId,
          question: values.question,
          answer: values.answer,
        });
      } else {
        await createFAQ.mutateAsync({
          question: values.question,
          answer: values.answer,
        });
      }
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Question</label>
        <input
          type="text"
          name="question"
          value={values.question}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Answer</label>
        <textarea
          name="answer"
          value={values.answer}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={createFAQ.isPending || updateFAQ.isPending}
      >
        {(createFAQ.isPending || updateFAQ.isPending) ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
