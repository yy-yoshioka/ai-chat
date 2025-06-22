import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

interface ComplianceControl {
  id: string;
  category: 'Security' | 'Availability' | 'Processing Integrity' | 'Confidentiality' | 'Privacy';
  title: string;
  description: string;
  status: 'implemented' | 'in_progress' | 'not_started' | 'not_applicable';
  evidence: Evidence[];
  lastReviewed: string;
  assignee: string;
  dueDate: string;
}

interface Evidence {
  id: string;
  type: 'document' | 'screenshot' | 'policy' | 'log' | 'attestation';
  name: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

interface AuditReport {
  id: string;
  type: 'soc2_type1' | 'soc2_type2' | 'iso27001' | 'pci_dss';
  status: 'draft' | 'in_review' | 'completed' | 'published';
  auditor: string;
  startDate: string;
  endDate: string;
  findings: number;
  recommendations: number;
}

const CompliancePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState<'controls' | 'evidence' | 'reports' | 'readiness'>(
    'controls'
  );
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadComplianceData = useCallback(async () => {
    try {
      const [controlsResponse, reportsResponse] = await Promise.all([
        fetch(`/api/organizations/${id}/compliance/controls`),
        fetch(`/api/organizations/${id}/compliance/reports`),
      ]);

      if (controlsResponse.ok) {
        const controlsData = await controlsResponse.json();
        setControls(controlsData);
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadComplianceData();
    }
  }, [id, loadComplianceData]);

  const updateControlStatus = (controlId: string, status: ComplianceControl['status']) => {
    setControls((prev) =>
      prev.map((control) => (control.id === controlId ? { ...control, status } : control))
    );
  };

  const uploadEvidence = async (controlId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('controlId', controlId);

    try {
      const response = await fetch(`/api/organizations/${id}/compliance/evidence`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        loadComplianceData();
        alert('エビデンスがアップロードされました');
      }
    } catch (error) {
      console.error('Failed to upload evidence:', error);
      alert('アップロードに失敗しました');
    }
  };

  const generateReadinessReport = async () => {
    try {
      const response = await fetch(`/api/organizations/${id}/compliance/readiness-report`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SOC2-Readiness-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('レポート生成に失敗しました');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'not_started':
        return 'bg-red-100 text-red-700';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return '🔒';
      case 'Availability':
        return '⚡';
      case 'Processing Integrity':
        return '🔧';
      case 'Confidentiality':
        return '🔐';
      case 'Privacy':
        return '👤';
      default:
        return '📋';
    }
  };

  const filteredControls = controls.filter(
    (control) => selectedCategory === 'all' || control.category === selectedCategory
  );

  const completionRate =
    controls.length > 0
      ? (controls.filter((c) => c.status === 'implemented').length / controls.length) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOC-2 Type I 監査準備</h1>
          <p className="text-gray-600 mt-1">コンプライアンス管理・監査準備・エビデンス収集</p>
        </div>
        <button
          onClick={generateReadinessReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📊 監査準備レポート生成
        </button>
      </div>

      {/* 統計概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総コントロール数</p>
              <p className="text-2xl font-bold text-gray-900">{controls.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">実装済み</p>
              <p className="text-2xl font-bold text-gray-900">
                {controls.filter((c) => c.status === 'implemented').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">進行中</p>
              <p className="text-2xl font-bold text-gray-900">
                {controls.filter((c) => c.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">完成率</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'controls', label: '📋 コントロール', desc: 'SOC-2統制管理' },
            { key: 'evidence', label: '📁 エビデンス', desc: '証跡・文書管理' },
            { key: 'reports', label: '📊 監査レポート', desc: '監査結果・レポート' },
            { key: 'readiness', label: '🎯 監査準備度', desc: '準備状況・改善点' },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() =>
                setSelectedTab(key as 'controls' | 'evidence' | 'reports' | 'readiness')
              }
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div>{label}</div>
                <div className="text-xs text-gray-400 mt-1">{desc}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* コントロールタブ */}
      {selectedTab === 'controls' && (
        <div className="space-y-6">
          {/* フィルター */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">カテゴリ:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">すべて</option>
                <option value="Security">Security</option>
                <option value="Availability">Availability</option>
                <option value="Processing Integrity">Processing Integrity</option>
                <option value="Confidentiality">Confidentiality</option>
                <option value="Privacy">Privacy</option>
              </select>
            </div>
          </div>

          {/* コントロール一覧 */}
          <div className="grid grid-cols-1 gap-4">
            {filteredControls.map((control) => (
              <div key={control.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getCategoryIcon(control.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{control.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{control.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-500">{control.category}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">担当: {control.assignee}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          期限: {new Date(control.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(control.status)}`}
                    >
                      {control.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ステータス
                    </label>
                    <select
                      value={control.status}
                      onChange={(e) =>
                        updateControlStatus(
                          control.id,
                          e.target.value as ComplianceControl['status']
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="not_started">未開始</option>
                      <option value="in_progress">進行中</option>
                      <option value="implemented">実装済み</option>
                      <option value="not_applicable">対象外</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      エビデンス ({control.evidence.length})
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadEvidence(control.id, file);
                        }}
                        className="hidden"
                        id={`evidence-${control.id}`}
                      />
                      <label
                        htmlFor={`evidence-${control.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        📎 アップロード
                      </label>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                        📋 一覧表示
                      </button>
                    </div>
                  </div>
                </div>

                {control.evidence.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      アップロード済みエビデンス
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {control.evidence.slice(0, 3).map((evidence) => (
                        <span
                          key={evidence.id}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center space-x-1"
                        >
                          <span>
                            {evidence.type === 'document'
                              ? '📄'
                              : evidence.type === 'screenshot'
                                ? '📷'
                                : '📋'}
                          </span>
                          <span>{evidence.name}</span>
                        </span>
                      ))}
                      {control.evidence.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{control.evidence.length - 3} 個
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* エビデンスタブ */}
      {selectedTab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">エビデンス管理</h3>

              <div className="space-y-4">
                {controls
                  .flatMap((control) =>
                    control.evidence.map((evidence) => ({
                      ...evidence,
                      controlTitle: control.title,
                      controlCategory: control.category,
                    }))
                  )
                  .map((evidence) => (
                    <div key={evidence.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">
                            {evidence.type === 'document'
                              ? '📄'
                              : evidence.type === 'screenshot'
                                ? '📷'
                                : evidence.type === 'policy'
                                  ? '📋'
                                  : evidence.type === 'log'
                                    ? '📊'
                                    : '✅'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{evidence.name}</h4>
                            <p className="text-sm text-gray-600">{evidence.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{evidence.controlTitle}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{evidence.uploadedBy}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(evidence.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                            表示
                          </button>
                          <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                            ダウンロード
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">エビデンス統計</h3>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">タイプ別内訳</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'document', label: '文書', count: 15, icon: '📄' },
                      { type: 'screenshot', label: 'スクリーンショット', count: 8, icon: '📷' },
                      { type: 'policy', label: 'ポリシー', count: 12, icon: '📋' },
                      { type: 'log', label: 'ログ', count: 25, icon: '📊' },
                      { type: 'attestation', label: '証明書', count: 6, icon: '✅' },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span>{item.icon}</span>
                          <span className="text-gray-700">{item.label}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 エビデンス収集のヒント</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 定期的なシステムログの自動収集</li>
                    <li>• ポリシー文書の最新版管理</li>
                    <li>• セキュリティ設定のスクリーンショット</li>
                    <li>• 従業員研修の受講証明書</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 監査レポートタブ */}
      {selectedTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.type.toUpperCase().replace('_', ' ')} 監査
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">監査人: {report.auditor}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        期間: {new Date(report.startDate).toLocaleDateString()} -{' '}
                        {new Date(report.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : report.status === 'in_review'
                          ? 'bg-yellow-100 text-yellow-700'
                          : report.status === 'published'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-600">指摘事項</p>
                    <p className="text-2xl font-bold text-red-900">{report.findings}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-yellow-600">推奨事項</p>
                    <p className="text-2xl font-bold text-yellow-900">{report.recommendations}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      レポート表示
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      ダウンロード
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">📊</span>
                <p className="text-lg">監査レポートがありません</p>
                <p className="text-sm">監査が完了すると、ここにレポートが表示されます</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 監査準備度タブ */}
      {selectedTab === 'readiness' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">監査準備度スコア</h3>

            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionRate / 100)}`}
                      className="text-blue-600"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {completionRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">総合準備度</p>
              </div>

              <div className="space-y-3">
                {[
                  { category: 'Security', progress: 85, color: 'bg-blue-600' },
                  { category: 'Availability', progress: 92, color: 'bg-green-600' },
                  { category: 'Processing Integrity', progress: 78, color: 'bg-yellow-600' },
                  { category: 'Confidentiality', progress: 88, color: 'bg-purple-600' },
                  { category: 'Privacy', progress: 73, color: 'bg-red-600' },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.category}</span>
                      <span className="text-gray-600">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">改善が必要な領域</h3>

              <div className="space-y-3">
                {[
                  {
                    title: 'データ保持ポリシー',
                    priority: 'high',
                    description: 'データ保持・削除のポリシー文書化が必要',
                    dueDate: '2024-02-15',
                  },
                  {
                    title: 'インシデント対応手順',
                    priority: 'medium',
                    description: 'セキュリティインシデント対応手順の見直し',
                    dueDate: '2024-02-28',
                  },
                  {
                    title: 'バックアップテスト',
                    priority: 'medium',
                    description: '定期的なバックアップリストアテストの実施',
                    dueDate: '2024-03-15',
                  },
                ].map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">期限: {item.dueDate}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">✅ 監査準備完了項目</h3>

              <ul className="space-y-2 text-sm text-green-800">
                <li>• セキュリティポリシー文書化</li>
                <li>• アクセス制御実装</li>
                <li>• ログ監視システム導入</li>
                <li>• 従業員セキュリティ研修</li>
                <li>• 暗号化設定</li>
                <li>• 脆弱性管理プロセス</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
