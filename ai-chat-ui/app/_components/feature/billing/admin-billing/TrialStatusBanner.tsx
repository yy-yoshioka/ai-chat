import { Subscription } from '@/app/_domains/billing';
import { calcTrialInfo } from '@/app/_utils/billing/trial-utils';

interface TrialStatusBannerProps {
  currentSubscription?: Subscription | null;
}

export function TrialStatusBanner({ currentSubscription }: TrialStatusBannerProps) {
  const { trialDaysRemaining, nextBillingDate } = calcTrialInfo(currentSubscription ?? null);

  if (!currentSubscription?.isTrialActive || trialDaysRemaining === null) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-center">
        <svg
          className="h-6 w-6 text-blue-500 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-blue-800">
          <strong>無料トライアル残り: {trialDaysRemaining}日</strong>
          {nextBillingDate && (
            <>
              <br />
              <span className="text-xs">
                次回請求日: {nextBillingDate.toLocaleDateString('ja-JP')}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
