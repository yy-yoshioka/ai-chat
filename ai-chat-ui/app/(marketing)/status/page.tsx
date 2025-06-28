'use client';

import { IncidentCard } from '@/app/_components/feature/status/IncidentCard';
import { StatusCard } from '@/app/_components/feature/status/StatusCard';
import { UptimeStat } from '@/app/_components/feature/status/UptimeStat';

import { STATUS_COLOR } from '@/app/_config/status/colors';
import { useStatus } from '@/app/_hooks/status/useStatus';
import { fmtDate } from '@/app/_utils/status/format';

export default function StatusPage() {
  const { system, incidents, uptime, loading } = useStatus();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );

  const overallOk = system.every((s) => s.status === 'operational');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <p className="text-gray-600">Current system status and incident history</p>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${overallOk ? STATUS_COLOR.operational.badge : STATUS_COLOR.partial_outage.badge}`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2
                ${overallOk ? STATUS_COLOR.operational.dot : STATUS_COLOR.partial_outage.dot}`}
              />
              {overallOk ? 'All Systems Operational' : 'Some Systems Experiencing Issues'}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {fmtDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Current Status */}
        <section className="bg-white rounded-lg shadow-sm border">
          <h2 className="px-6 py-4 border-b text-xl font-semibold">Current Status</h2>
          <div className="p-6 space-y-4">
            {system.map((s) => (
              <StatusCard key={s.component} s={s} />
            ))}
          </div>
        </section>

        {/* Uptime */}
        <section className="bg-white rounded-lg shadow-sm border">
          <h2 className="px-6 py-4 border-b text-xl font-semibold">Uptime Statistics</h2>
          <UptimeStat list={uptime} />
        </section>

        {/* Incidents */}
        <section className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Incidents</h2>
            <a href="/api/status/rss" className="text-sm text-blue-600 hover:text-blue-800">
              RSS Feed
            </a>
          </div>
          <IncidentCard incidents={incidents} />
        </section>
      </main>
    </div>
  );
}
