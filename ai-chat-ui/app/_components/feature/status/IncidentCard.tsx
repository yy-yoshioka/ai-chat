'use client';

import { fmtDate } from '@/app/_utils/status/format';
import type { Incident } from '@/app/_hooks/status/useStatus';

interface Props {
  incidents: Incident[];
}

/** 直近インシデントのリスト表示 */
export const IncidentCard: React.FC<Props> = ({ incidents }) => {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No recent incidents</h3>
        <p className="text-gray-600">All systems have been running smoothly.</p>
      </div>
    );
  }

  const impactColor = (impact: Incident['impact']) =>
    impact === 'critical'
      ? 'border-red-400'
      : impact === 'major'
        ? 'border-orange-400'
        : 'border-yellow-400';

  const statusBadge = (status: Incident['status']) =>
    status === 'resolved'
      ? 'bg-green-100 text-green-800'
      : status === 'monitoring'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-orange-100 text-orange-800';

  return (
    <div className="space-y-6">
      {incidents.map((incident) => (
        <article key={incident.id} className={`border-l-4 ${impactColor(incident.impact)} pl-4`}>
          <header className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{incident.title}</h3>
              <div className="flex items-center mt-1 space-x-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(incident.status)}`}
                >
                  {incident.status}
                </span>
                <span className="text-sm text-gray-500">{incident.impact} impact</span>
              </div>
            </div>
            <time className="text-sm text-gray-500">{fmtDate(incident.createdAt)}</time>
          </header>

          <p className="text-gray-600 mt-2">{incident.description}</p>

          <div className="mt-4 space-y-2">
            {incident.updates.map((u, i) => (
              <div key={i} className="text-sm">
                <div className="flex items-center space-x-2">
                  <time className="text-gray-500">{fmtDate(u.timestamp)}</time>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusBadge(u.status as Incident['status'])}`}
                  >
                    {u.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{u.message}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
};
