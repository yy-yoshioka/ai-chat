import { useState } from 'react';
import { api } from '@/app/_lib/api';

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
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { question: values.question, answer: values.answer };
    if (faqId) {
      await api.put(`/faqs/${faqId}`, payload);
    } else {
      await api.post('/faqs', payload);
    }
    setLoading(false);
    onSubmitSuccess?.();
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
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
