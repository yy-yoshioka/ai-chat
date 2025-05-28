import AuthGuard from '@/components/AuthGuard';
import ChartView from '@/components/Dashboard/ChartView';
import ReportTable from '@/components/Dashboard/ReportTable';

export default function DashboardPage() {
  const dummyData = [
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
  ];
  const dummyRows = [
    { id: '1', value: 'Chat 1' },
    { id: '2', value: 'Chat 2' },
  ];

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ChartView title="Example Chart" data={dummyData} />
        <ReportTable rows={dummyRows} />
      </div>
    </AuthGuard>
  );
}
