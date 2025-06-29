import React from 'react';
import type { DailyStat } from '@/_schemas/reports';
import { REPORT_CONSTANTS } from '@/_config/reports/constants';

interface SatisfactionChartProps {
  dailyStats: DailyStat[];
}

export function SatisfactionChart({ dailyStats }: SatisfactionChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">満足度推移</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {dailyStats.map((stat) => (
          <div key={stat.date} className="flex-1 flex flex-col items-center">
            <div
              className="bg-yellow-500 w-full rounded-t"
              style={{
                height: `${(stat.satisfaction / REPORT_CONSTANTS.SATISFACTION_MAX_RATING) * REPORT_CONSTANTS.MAX_CHART_HEIGHT_PX}px`,
              }}
            />
            <div className="text-xs text-gray-500 mt-2">
              {new Date(stat.date).toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
