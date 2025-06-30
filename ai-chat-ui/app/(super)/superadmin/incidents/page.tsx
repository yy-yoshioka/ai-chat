'use client';

import { useState } from 'react';
import { IncidentStats } from './_components/IncidentStats';
import { IncidentsTable } from './_components/IncidentsTable';
import { RecentUpdates } from './_components/RecentUpdates';
import { mockIncidents } from './data';

export default function IncidentsPage() {
  const [incidents] = useState(mockIncidents);

  return (
    <div className="space-y-6">
      <IncidentStats incidents={incidents} />

      {/* Create New Incident Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">インシデント一覧</h2>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
          + 新規インシデント作成
        </button>
      </div>

      <IncidentsTable incidents={incidents} />
      <RecentUpdates />
    </div>
  );
}
