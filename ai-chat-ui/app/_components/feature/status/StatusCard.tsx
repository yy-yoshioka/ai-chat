// StatusCard.tsx
import { STATUS_COLOR } from '@/app/_config/status/colors';
import { SystemStatus } from '@/app/_hooks/status/useStatus';

export const StatusCard: React.FC<{ s: SystemStatus }> = ({ s }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-3 ${STATUS_COLOR[s.status].dot}`} />
      <div>
        <h3 className="font-medium">{s.component}</h3>
        <p className="text-sm text-gray-600">{s.description}</p>
      </div>
    </div>
    <span className={`text-sm font-medium capitalize ${STATUS_COLOR[s.status].text}`}>
      {s.status.replace('_', ' ')}
    </span>
  </div>
);
