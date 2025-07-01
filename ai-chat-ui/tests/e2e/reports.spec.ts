import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reports page
    await page.goto('/admin/org-1/reports');
  });

  test('should display report summary', async ({ page }) => {
    // Wait for reports to load
    await expect(page.getByText('Reports')).toBeVisible();

    // Check summary cards
    await expect(page.getByTestId('total-chats-card')).toBeVisible();
    await expect(page.getByTestId('unique-users-card')).toBeVisible();
    await expect(page.getByTestId('total-tokens-card')).toBeVisible();
    await expect(page.getByTestId('avg-tokens-card')).toBeVisible();

    // Check top questions section
    await expect(page.getByText('Top Questions')).toBeVisible();
    const questionItems = await page.getByTestId('question-item').all();
    expect(questionItems.length).toBeGreaterThan(0);
  });

  test('should filter reports by date range', async ({ page }) => {
    // Open date filter
    await page.getByRole('button', { name: /date range/i }).click();

    // Select last 7 days
    await page.getByRole('button', { name: /last 7 days/i }).click();

    // Wait for data refresh
    await page.waitForLoadState('networkidle');

    // Check date range displayed
    await expect(page.getByTestId('date-range-display')).toContainText('Last 7 days');
  });

  test('should filter reports by widget', async ({ page }) => {
    // Select widget filter
    await page.getByLabel('Filter by widget').selectOption('widget-1');

    // Wait for filtered data
    await page.waitForLoadState('networkidle');

    // Check filter applied indicator
    await expect(page.getByTestId('active-filters')).toContainText('Widget: Test Widget 1');
  });

  test('should display chart data', async ({ page }) => {
    // Click on chart tab
    await page.getByRole('tab', { name: /chart/i }).click();

    // Check chart is visible
    await expect(page.getByTestId('report-chart')).toBeVisible();

    // Check chart controls
    await expect(page.getByLabel('Group by')).toBeVisible();

    // Change grouping
    await page.getByLabel('Group by').selectOption('hour');

    // Wait for chart update
    await page.waitForLoadState('networkidle');

    // Check chart updated
    await expect(page.getByTestId('chart-title')).toContainText('Hourly');
  });

  test('should export reports as CSV', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.getByRole('button', { name: /export csv/i }).click();

    // Wait for download
    const download = await downloadPromise;

    // Check file name
    expect(download.suggestedFilename()).toContain('chat-report');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should show empty state for no data', async ({ page, context }) => {
    // Intercept API call and return empty data
    await context.route('**/api/reports/summary', (route) => {
      route.fulfill({
        status: 200,
        json: {
          totalChats: 0,
          uniqueUsers: 0,
          totalTokens: 0,
          avgTokensPerChat: 0,
          topQuestions: [],
        },
      });
    });

    // Reload page
    await page.reload();

    // Check empty state
    await expect(page.getByText(/no data available/i)).toBeVisible();
    await expect(page.getByText(/select a different date range/i)).toBeVisible();
  });

  test('should refresh report data', async ({ page }) => {
    // Get initial value
    const initialValue = await page.getByTestId('total-chats-value').textContent();

    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();

    // Check loading state
    await expect(page.getByTestId('loading-overlay')).toBeVisible();

    // Wait for data to load
    await expect(page.getByTestId('loading-overlay')).not.toBeVisible();

    // Check data refreshed (timestamp should be updated)
    await expect(page.getByTestId('last-updated')).toContainText('Last updated:');
  });

  test('should switch between different chart types', async ({ page }) => {
    // Navigate to chart tab
    await page.getByRole('tab', { name: /chart/i }).click();

    // Check default chart type
    await expect(page.getByTestId('line-chart')).toBeVisible();

    // Switch to bar chart
    await page.getByRole('button', { name: /bar chart/i }).click();
    await expect(page.getByTestId('bar-chart')).toBeVisible();

    // Switch to pie chart
    await page.getByRole('button', { name: /pie chart/i }).click();
    await expect(page.getByTestId('pie-chart')).toBeVisible();
  });
});
