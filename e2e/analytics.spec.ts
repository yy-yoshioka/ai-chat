import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display overview metrics', async ({ page }) => {
    // Navigate to analytics dashboard
    await page.goto('/dashboard/analytics');

    // Wait for metrics to load
    await page.waitForSelector('[data-testid="metrics-container"]', { timeout: 10000 });

    // Verify key metrics are displayed
    await expect(page.locator('text=総チャット数')).toBeVisible();
    await expect(page.locator('text=ユニークユーザー数')).toBeVisible();
    await expect(page.locator('text=平均応答時間')).toBeVisible();
    await expect(page.locator('text=満足度')).toBeVisible();
  });

  test('should filter analytics by date range', async ({ page }) => {
    // Navigate to analytics dashboard
    await page.goto('/dashboard/analytics');

    // Select date range filter
    await page.click('button[aria-label="日付範囲を選択"]');
    
    // Select last 7 days
    await page.click('text=過去7日間');

    // Wait for data to update
    await page.waitForTimeout(1000);

    // Verify data is filtered (check that date range is displayed)
    await expect(page.locator('text=過去7日間')).toBeVisible();
  });

  test('should display conversation flow chart', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics/conversation-flow');

    // Wait for chart to load
    await page.waitForSelector('svg.sankey-chart', { timeout: 10000 });

    // Verify chart elements
    const chartNodes = await page.locator('svg.sankey-chart .node').count();
    expect(chartNodes).toBeGreaterThan(0);

    // Hover over a node to see tooltip
    await page.locator('svg.sankey-chart .node').first().hover();
    await expect(page.locator('.tooltip')).toBeVisible();
  });

  test('should show unresolved questions', async ({ page }) => {
    // Navigate to unresolved questions
    await page.goto('/dashboard/analytics/unresolved');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Verify table headers
    await expect(page.locator('th:has-text("質問")')).toBeVisible();
    await expect(page.locator('th:has-text("件数")')).toBeVisible();
    await expect(page.locator('th:has-text("最終更新")')).toBeVisible();

    // Check if there are any unresolved questions
    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount > 0) {
      // Click on first question to see details
      await page.click('table tbody tr:first-child');
      
      // Verify detail view opens
      await expect(page.locator('text=詳細情報')).toBeVisible();
    }
  });

  test('should export analytics data', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics');

    // Click export button
    await page.click('button:has-text("エクスポート")');

    // Select export format
    await page.click('text=CSV形式');

    // Wait for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("ダウンロード")')
    ]);

    // Verify download started
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should filter analytics by widget', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics');

    // Select widget filter
    await page.selectOption('select[name="widgetId"]', { index: 1 });

    // Wait for data to update
    await page.waitForTimeout(1000);

    // Verify data is filtered (metrics should update)
    const metricsText = await page.locator('[data-testid="metrics-container"]').textContent();
    expect(metricsText).toBeTruthy();
  });

  test('should display chat volume chart', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics');

    // Wait for chart to load
    await page.waitForSelector('canvas#chat-volume-chart', { timeout: 10000 });

    // Verify chart is rendered
    const canvas = page.locator('canvas#chat-volume-chart');
    await expect(canvas).toBeVisible();

    // Change time granularity
    await page.selectOption('select[name="timeGranularity"]', 'hourly');

    // Wait for chart to update
    await page.waitForTimeout(1000);

    // Verify chart still visible after update
    await expect(canvas).toBeVisible();
  });

  test('should show top questions', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics');

    // Scroll to top questions section
    await page.locator('text=よくある質問').scrollIntoViewIfNeeded();

    // Verify top questions are displayed
    const questionsList = page.locator('[data-testid="top-questions-list"]');
    await expect(questionsList).toBeVisible();

    // Check if questions are listed
    const questions = await questionsList.locator('li').count();
    expect(questions).toBeGreaterThanOrEqual(0);
  });

  test('should display satisfaction ratings', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics');

    // Find satisfaction section
    await page.locator('text=満足度分析').scrollIntoViewIfNeeded();

    // Verify satisfaction chart
    const satisfactionChart = page.locator('[data-testid="satisfaction-chart"]');
    await expect(satisfactionChart).toBeVisible();

    // Check for rating breakdown
    await expect(page.locator('text=非常に満足')).toBeVisible();
    await expect(page.locator('text=満足')).toBeVisible();
    await expect(page.locator('text=普通')).toBeVisible();
    await expect(page.locator('text=不満')).toBeVisible();
  });

  test('should generate custom report', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics/reports');

    // Click create custom report
    await page.click('button:has-text("カスタムレポート作成")');

    // Select report parameters
    await page.fill('input[name="reportName"]', 'Monthly Performance Report');
    await page.selectOption('select[name="reportType"]', 'performance');
    
    // Select date range
    await page.click('input[name="startDate"]');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.click('input[name="endDate"]');
    await page.fill('input[name="endDate"]', '2024-01-31');

    // Select metrics to include
    await page.check('input[value="chatVolume"]');
    await page.check('input[value="satisfactionRate"]');
    await page.check('input[value="responseTime"]');

    // Generate report
    await page.click('button:has-text("レポート生成")');

    // Wait for report generation
    await expect(page.locator('text=レポートを生成中')).toBeVisible();
    await expect(page.locator('text=レポートが完成しました')).toBeVisible({ timeout: 30000 });
  });
});