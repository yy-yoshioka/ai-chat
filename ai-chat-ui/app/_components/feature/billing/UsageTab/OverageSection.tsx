import { formatPrice } from '@/app/_config/billing/utils';
import type { EnhancedUsageData } from '@/app/_schemas/billing';

interface OverageSectionProps {
  overage: EnhancedUsageData['overage'];
}

export function OverageSection({ overage }: OverageSectionProps) {
  if (overage.totalCost <= 0) return null;

  return (
    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">超過料金</h3>
      <div className="space-y-2">
        {overage.messages > 0 && (
          <div className="flex justify-between text-sm">
            <span>メッセージ超過分</span>
            <span className="font-medium">{formatPrice(overage.messages, 'USD')}</span>
          </div>
        )}
        {overage.users > 0 && (
          <div className="flex justify-between text-sm">
            <span>ユーザー超過分</span>
            <span className="font-medium">{formatPrice(overage.users, 'USD')}</span>
          </div>
        )}
        {overage.storage > 0 && (
          <div className="flex justify-between text-sm">
            <span>ストレージ超過分</span>
            <span className="font-medium">{formatPrice(overage.storage, 'USD')}</span>
          </div>
        )}
        {overage.apiCalls > 0 && (
          <div className="flex justify-between text-sm">
            <span>API呼び出し超過分</span>
            <span className="font-medium">{formatPrice(overage.apiCalls, 'USD')}</span>
          </div>
        )}
        <div className="pt-2 border-t border-yellow-300">
          <div className="flex justify-between text-sm font-semibold">
            <span>超過料金合計</span>
            <span>{formatPrice(overage.totalCost, 'USD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
