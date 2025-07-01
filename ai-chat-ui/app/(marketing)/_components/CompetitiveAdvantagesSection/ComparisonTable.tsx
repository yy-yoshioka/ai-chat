interface ComparisonData {
  feature: string;
  ai: string;
  intercom: string;
  zendesk: string;
  other: string;
}

interface ComparisonTableProps {
  data: ComparisonData[];
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <h3 className="text-2xl font-bold text-center">機能比較表</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">機能</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-blue-600">AI Chat</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Intercom</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Zendesk</th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">其他社A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                <td className="px-6 py-4 text-sm text-center text-blue-600 font-semibold">
                  {row.ai}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-500">{row.intercom}</td>
                <td className="px-6 py-4 text-sm text-center text-gray-500">{row.zendesk}</td>
                <td className="px-6 py-4 text-sm text-center text-gray-500">{row.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
