import { test, expect } from '@playwright/test';
import { generateTestUser } from '../fixtures/user';

test.describe('Billing and Usage Flow', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Login as admin user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Plan upgrade flow (mock)', async ({ page }) => {
    // Navigate to billing page
    await page.goto('/admin/default/billing');

    // Verify current plan display
    await expect(page.locator('[data-testid="current-plan"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-summary"]')).toBeVisible();

    // Test plan upgrade
    await page.click('[data-testid="upgrade-to-pro"]');

    // Verify Stripe checkout session creation (mock)
    await expect(page.locator('[data-testid="checkout-redirect"]')).toBeVisible();

    // Mock successful payment flow
    await page.click('[data-testid="mock-success-payment"]');

    // Verify success message
    await expect(page.locator('[data-testid="upgrade-success"]')).toContainText(
      'Plan upgraded successfully'
    );

    // Verify plan change reflection
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro Plan');
  });

  test('Usage monitoring and limits', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Verify usage charts are displayed
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="messages-usage"]')).toBeVisible();
    await expect(page.locator('[data-testid="tokens-usage"]')).toBeVisible();

    // Test usage warnings
    await expect(page.locator('[data-testid="usage-warning"]')).toBeVisible();

    // Test different time periods
    await page.selectOption('[data-testid="usage-period"]', '7d');
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();

    await page.selectOption('[data-testid="usage-period"]', '30d');
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();

    await page.selectOption('[data-testid="usage-period"]', '90d');
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
  });

  test('Customer portal access (mock)', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Test customer portal link
    await page.click('[data-testid="manage-billing"]');

    // Mock customer portal redirect
    await expect(page.locator('[data-testid="portal-redirect"]')).toBeVisible();

    // Verify portal opens in new tab (mock)
    const [portalPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="open-portal"]'),
    ]);

    await expect(portalPage.locator('[data-testid="stripe-portal"]')).toBeVisible();
    await portalPage.close();
  });

  test('Invoice download functionality', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Navigate to invoices section
    await page.click('[data-testid="invoices-tab"]');

    // Verify invoices table
    await expect(page.locator('[data-testid="invoices-table"]')).toBeVisible();

    // Test invoice download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-invoice-0"]');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Token balance management', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Verify token balance display
    await expect(page.locator('[data-testid="token-balance"]')).toBeVisible();

    // Test token purchase
    await page.click('[data-testid="buy-tokens"]');

    // Select token package
    await page.selectOption('[data-testid="token-package"]', '10000');
    await page.click('[data-testid="purchase-tokens"]');

    // Mock successful token purchase
    await page.click('[data-testid="mock-token-success"]');

    // Verify balance update
    await expect(page.locator('[data-testid="purchase-success"]')).toContainText(
      'Tokens purchased successfully'
    );
    await expect(page.locator('[data-testid="token-balance"]')).toContainText('10,000');
  });

  test('Usage alerts and notifications', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Navigate to notification settings
    await page.click('[data-testid="notification-settings"]');

    // Test usage alert thresholds
    await page.fill('[data-testid="message-threshold"]', '80');
    await page.fill('[data-testid="token-threshold"]', '90');

    // Enable email notifications
    await page.check('[data-testid="email-notifications"]');

    // Set notification email
    await page.fill('[data-testid="notification-email"]', testUser.email);

    // Save settings
    await page.click('[data-testid="save-notifications"]');

    // Verify success
    await expect(page.locator('[data-testid="notification-success"]')).toContainText(
      'Notification settings saved'
    );
  });

  test('Billing history and analytics', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Navigate to billing history
    await page.click('[data-testid="billing-history"]');

    // Verify billing timeline
    await expect(page.locator('[data-testid="billing-timeline"]')).toBeVisible();

    // Test analytics charts
    await expect(page.locator('[data-testid="spending-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-trends"]')).toBeVisible();

    // Test export functionality
    const exportPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-billing-data"]');

    const exportFile = await exportPromise;
    expect(exportFile.suggestedFilename()).toContain('.csv');
  });

  test('Subscription cancellation flow (mock)', async ({ page }) => {
    await page.goto('/admin/default/billing');

    // Navigate to subscription management
    await page.click('[data-testid="manage-subscription"]');

    // Test cancellation
    await page.click('[data-testid="cancel-subscription"]');

    // Confirm cancellation in modal
    await expect(page.locator('[data-testid="cancellation-modal"]')).toBeVisible();
    await page.fill('[data-testid="cancellation-reason"]', 'Testing cancellation flow');
    await page.click('[data-testid="confirm-cancellation"]');

    // Mock cancellation success
    await expect(page.locator('[data-testid="cancellation-success"]')).toContainText(
      'Subscription cancelled successfully'
    );

    // Verify plan reverts to free
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Free Plan');
  });
});
