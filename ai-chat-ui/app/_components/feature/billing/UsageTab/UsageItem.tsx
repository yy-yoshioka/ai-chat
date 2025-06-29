import { calculateUsagePercentage, getUsageColor } from '@/app/_config/billing/utils';

interface UsageItemProps {
  name: string;
  used: number;
  limit: number;
  unit: string;
}

export function UsageItem({ name, used, limit, unit }: UsageItemProps) {
  const percentage = calculateUsagePercentage(used, limit);
  const color = getUsageColor(percentage);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{name}</span>
        <span className={`font-medium ${color}`}>
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 90
              ? 'bg-red-500'
              : percentage >= 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{percentage}% 使用中</p>
    </div>
  );
}
