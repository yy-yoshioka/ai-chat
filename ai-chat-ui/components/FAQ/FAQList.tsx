import { useEffect, useState } from 'react';
import FAQItem, { FAQItemProps } from './FAQItem';
import { api } from '@/lib/api';

export default function FAQList() {
  const [faqs, setFaqs] = useState<FAQItemProps[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await api.get<{ faqs: FAQItemProps[] }>('/faqs');
      if (data?.faqs) {
        setFaqs(data.faqs);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div>
      {faqs.map((faq) => (
        <FAQItem key={faq.id} {...faq} />
      ))}
      {faqs.length === 0 && <p>No FAQs available.</p>}
    </div>
  );
}
