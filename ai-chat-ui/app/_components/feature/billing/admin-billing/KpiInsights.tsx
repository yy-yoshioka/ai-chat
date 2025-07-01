const insights = [
  'Trial to Paid転換率が業界平均（20%）を上回っています',
  'チャーン率が低く、顧客満足度の高いサービスを提供できています',
  'MRRが順調に成長しており、持続可能なビジネスモデルを構築中です',
  '新規トライアルユーザーが増加傾向にあり、認知度向上の効果が見られます',
];

export default function KpiInsights() {
  return (
    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 主要インサイト</h3>
      <div className="space-y-2 text-sm text-blue-800">
        {insights.map((insight, index) => (
          <p key={index}>• {insight}</p>
        ))}
      </div>
    </div>
  );
}
