interface CheckoutSession {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  trialEnd?: string;
  isTrialActive: boolean;
}

interface PlanDetailsProps {
  session: CheckoutSession;
}

export default function PlanDetails({ session }: PlanDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">プラン詳細</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">選択プラン</h3>
          <p className="text-lg font-semibold text-gray-900">{session.planName}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">月額料金</h3>
          <p className="text-lg font-semibold text-gray-900">
            ¥{session.amount.toLocaleString()}/月
          </p>
        </div>

        {session.isTrialActive && session.trialEnd && (
          <>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">トライアル期間</h3>
              <p className="text-lg font-semibold text-green-600">14日間無料</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">初回課金日</h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(session.trialEnd).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </>
        )}
      </div>

      {session.isTrialActive && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>14日間無料トライアル中</strong>
                <br />
                トライアル期間中はいつでもキャンセル可能です。
                {session.trialEnd &&
                  ` ${new Date(session.trialEnd).toLocaleDateString('ja-JP')} に初回課金が行われます。`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
