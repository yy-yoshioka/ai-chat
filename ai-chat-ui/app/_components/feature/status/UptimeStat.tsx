'use client';

import { UptimeStat as UptimeStatType } from '@/app/_hooks/status/useStatus';
import { percent } from '@/app/_utils/status/format';

interface Props {
  list: UptimeStatType[];
}

/** Uptime の小さなグリッドカード */
export const UptimeStat: React.FC<Props> = ({ list }) => (
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {list.map((u) => (
        <div key={u.period} className="text-center">
          <div className="text-3xl font-bold text-green-600">{percent(u.percentage)}</div>
          <div className="text-sm text-gray-600 mt-1">{u.period} uptime</div>
        </div>
      ))}
    </div>
  </div>
);
