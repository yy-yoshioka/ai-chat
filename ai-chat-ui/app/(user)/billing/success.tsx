'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SuccessHeader from '@/app/_components/feature/billing/success/SuccessHeader';
import PlanDetails from '@/app/_components/feature/billing/success/PlanDetails';
import NextSteps from '@/app/_components/feature/billing/success/NextSteps';
import LoadingState from '@/app/_components/feature/billing/success/LoadingState';
import ErrorState from '@/app/_components/feature/billing/success/ErrorState';
import { useCheckoutSession } from '@/app/_hooks/billing/useCheckoutSession';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const { session, loading, error } = useCheckoutSession(sessionId);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SuccessHeader isTrialActive={session?.isTrialActive || false} />

        {session && (
          <>
            <PlanDetails session={session} />
            <NextSteps />
          </>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link
            href="/admin/org-selector"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            管理画面へ進む
          </Link>

          <div className="text-sm text-gray-500">
            ご質問がございましたら、
            <Link href="/help" className="text-blue-600 hover:text-blue-800 font-medium">
              ヘルプセンター
            </Link>
            をご確認ください。
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
