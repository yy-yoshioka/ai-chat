'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCheckout } from '@/app/_hooks/billing/useCheckout';
import { MILLISECONDS_PER_DAY } from '@/app/_config/billing/constants';

export function TrialAlert() {
  const pathname = usePathname();
  const { checkout, loading } = useCheckout();

  // Mock trial data - replace with actual trial data from your API/context
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

  const today = new Date();
  const timeDiff = trialEndDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);

  // Don't show alert if trial period is over or not in trial
  if (daysLeft <= 0) return null;

  const handleUpgradeClick = async () => {
    try {
      // Get current organization ID from URL
      const orgId = pathname.split('/')[3]; // Extract from /admin/[orgId]/billing-plans

      if (!orgId) {
        alert('組織IDが見つかりません');
        return;
      }

      // Use Pro plan as default upgrade option
      await checkout('price_pro_monthly', orgId);
    } catch (error) {
      console.error('Error during upgrade:', error);
      alert('アップグレード処理中にエラーが発生しました');
    }
  };

  const severity = daysLeft <= 3 ? 'error' : 'warning';
  const bgColor = severity === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = severity === 'error' ? 'border-red-200' : 'border-yellow-200';
  const textColor = severity === 'error' ? 'text-red-800' : 'text-yellow-800';

  return (
    <div className={`mb-6 p-4 ${bgColor} border ${borderColor} rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className={`h-5 w-5 ${textColor}`} viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className={`text-sm font-medium ${textColor}`}>
            無料トライアル期間が残り{daysLeft}日で終了します
          </p>
        </div>
        <button
          onClick={handleUpgradeClick}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '処理中...' : '今すぐアップグレード'}
        </button>
      </div>
    </div>
  );
}
