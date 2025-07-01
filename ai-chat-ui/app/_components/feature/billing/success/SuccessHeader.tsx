interface SuccessHeaderProps {
  isTrialActive: boolean;
}

export default function SuccessHeader({ isTrialActive }: SuccessHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">お申し込みありがとうございます！</h1>
      <p className="text-lg text-gray-600">
        {isTrialActive
          ? '14日間の無料トライアルが開始されました'
          : 'サブスクリプションが有効になりました'}
      </p>
    </div>
  );
}
