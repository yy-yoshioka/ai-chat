/**
 * 組織 ID を受け取り、メール本文で使う URL セットを生成
 */
export function generateEmailUrls(orgId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    setupGuideUrl: `${base}/onboarding/step-install`,
    dashboardUrl: `${base}/admin/org/${orgId}`,
    supportUrl: `${base}/help/support`,
    upgradeUrl: `${base}/admin/org/${orgId}/billing-plans`,
    extendTrialUrl: `${base}/onboarding/step-install`,
    contactUrl: `${base}/help/contact`,
  };
}
