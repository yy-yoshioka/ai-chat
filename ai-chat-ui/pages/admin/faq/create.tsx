import { useRouter } from 'next/router';
import AuthGuard from '@/components/AuthGuard';
import FAQForm from '@/components/FAQ/FAQForm';

export default function CreateFAQPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create FAQ</h1>
        <FAQForm onSubmitSuccess={() => router.push('/admin/faq')} />
      </div>
    </AuthGuard>
  );
}
