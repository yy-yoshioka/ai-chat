'use client';

import { useState, useEffect } from 'react';
import { TrialAlert } from '@/app/_components/feature/billing/TrialAlert';
import { StatsOverview } from '@/app/_components/feature/billing/StatsOverview';
import { TabNavigation } from '@/app/_components/feature/billing/TabNavigation';
import { PlansTab } from '@/app/_components/feature/billing/PlansTab';
import { UsageTab } from '@/app/_components/feature/billing/UsageTab';
import type { EnhancedBillingPlan, EnhancedUsageData, OverageAlert } from '@/app/_schemas/billing';
import { mockBillingPlans, createMockUsageData } from '@/app/_fixtures/billing.fixtures';

export default function BillingPlansPage() {
  const [billingPlans, setBillingPlans] = useState<EnhancedBillingPlan[]>([]);
  const [usageData, setUsageData] = useState<EnhancedUsageData | null>(null);
  const [overageAlerts, setOverageAlerts] = useState<OverageAlert[]>([]);
  const [activeTab, setActiveTab] = useState('plans');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  async function loadBillingData() {
    try {
      // Mock data loading - replace with actual API calls
      setBillingPlans(mockBillingPlans);
      setUsageData(createMockUsageData('123', 'Free'));
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanUpgrade(planId: string) {
    console.log('Upgrading to plan:', planId);
    // Implementation for plan upgrade
  }

  if (loading) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">料金プラン管理</h1>
        <p className="text-gray-600 mt-2">組織の料金プランと利用状況を管理します</p>
      </div>

      <TrialAlert />
      <StatsOverview usageData={usageData} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'plans' && <PlansTab plans={billingPlans} onUpgrade={handlePlanUpgrade} />}
        {activeTab === 'usage' && <UsageTab usageData={usageData} />}
        {activeTab === 'overage' && <div className="text-gray-500">超過料金設定タブの実装予定</div>}
        {activeTab === 'analytics' && <div className="text-gray-500">分析タブの実装予定</div>}
      </div>
    </div>
  );
}
