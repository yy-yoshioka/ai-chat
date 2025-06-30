import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useCreateFaq(orgId: string) {
  const router = useRouter();
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

  return {
    formData,
    loading,
    handleSubmit,
    handleChange,
  };
}
