'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { HeroSection } from './_components/HeroSection';
import { ROICalculatorSection } from './_components/ROICalculatorSection';
import { CompetitiveAdvantagesSection } from './_components/CompetitiveAdvantagesSection';
import { BetaInviteSection } from './_components/BetaInviteSection';
import { CustomerSuccessSection } from './_components/CustomerSuccessSection';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // ユーザーがログイン済みの場合は組織選択ページにリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/admin/org-selector');
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">組織選択ページに移動中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ROICalculatorSection />
      <CompetitiveAdvantagesSection />
      <BetaInviteSection />
      <CustomerSuccessSection />
    </div>
  );
}
