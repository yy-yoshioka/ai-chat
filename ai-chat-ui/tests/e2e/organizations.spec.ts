import { test, expect } from '@playwright/test';

test.describe('Organizations Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await page.goto('/admin/org-1/settings');
  });

  test('should display organization details', async ({ page }) => {
    // Check organization info section
    await expect(page.getByText('Organization Details')).toBeVisible();

    // Check fields displayed
    await expect(page.getByTestId('org-name')).toBeVisible();
    await expect(page.getByTestId('org-slug')).toBeVisible();
    await expect(page.getByTestId('org-plan')).toBeVisible();
    await expect(page.getByTestId('org-created')).toBeVisible();
  });

  test('should display organization statistics', async ({ page }) => {
    // Check stats section
    await expect(page.getByText('Organization Statistics')).toBeVisible();

    // Check stat cards
    await expect(page.getByTestId('total-users-stat')).toBeVisible();
    await expect(page.getByTestId('active-users-stat')).toBeVisible();
    await expect(page.getByTestId('total-widgets-stat')).toBeVisible();
    await expect(page.getByTestId('total-chats-stat')).toBeVisible();
    await expect(page.getByTestId('storage-used-stat')).toBeVisible();
    await expect(page.getByTestId('api-calls-stat')).toBeVisible();
  });

  test('should update organization name', async ({ page }) => {
    // Click edit button
    await page.getByRole('button', { name: /edit organization/i }).click();

    // Wait for form
    await expect(page.getByRole('dialog')).toBeVisible();

    // Update name
    await page.getByLabel('Organization Name').clear();
    await page.getByLabel('Organization Name').fill('Updated Organization');

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();

    // Check success message
    await expect(page.getByText(/organization updated successfully/i)).toBeVisible();

    // Check name updated
    await expect(page.getByTestId('org-name')).toContainText('Updated Organization');
  });

  test('should update organization settings', async ({ page }) => {
    // Navigate to dashboard settings tab
    await page.getByRole('tab', { name: /dashboard settings/i }).click();

    // Check current settings
    await expect(page.getByText('Dashboard Layout')).toBeVisible();

    // Add widget to dashboard
    await page.getByRole('button', { name: /add widget/i }).click();

    // Select widget from dropdown
    await page.getByLabel('Select widget').selectOption('stats-widget');

    // Save layout
    await page.getByRole('button', { name: /save layout/i }).click();

    // Check success message
    await expect(page.getByText(/dashboard layout updated/i)).toBeVisible();
  });

  test('should validate organization name', async ({ page }) => {
    // Click edit button
    await page.getByRole('button', { name: /edit organization/i }).click();

    // Clear name and try to save
    await page.getByLabel('Organization Name').clear();
    await page.getByRole('button', { name: /save changes/i }).click();

    // Check validation error
    await expect(page.getByText(/organization name is required/i)).toBeVisible();

    // Enter invalid name (too short)
    await page.getByLabel('Organization Name').fill('ab');

    // Check validation error
    await expect(page.getByText(/name must be at least 3 characters/i)).toBeVisible();
  });

  test('should show plan upgrade prompt for free plan', async ({ page, context }) => {
    // Mock organization with free plan
    await context.route('**/api/organizations', (route) => {
      route.fulfill({
        status: 200,
        json: {
          id: 'org-1',
          name: 'Test Organization',
          slug: 'test-org',
          plan: 'free',
          userCount: 3,
          widgetCount: 1,
        },
      });
    });

    // Reload page
    await page.reload();

    // Check upgrade prompt
    await expect(page.getByTestId('upgrade-prompt')).toBeVisible();
    await expect(page.getByText(/upgrade to pro/i)).toBeVisible();

    // Click upgrade button
    await page.getByRole('button', { name: /upgrade now/i }).click();

    // Should navigate to billing
    await expect(page).toHaveURL(/\/billing$/);
  });

  test('should refresh organization stats', async ({ page }) => {
    // Click refresh stats button
    await page.getByRole('button', { name: /refresh stats/i }).click();

    // Check loading state
    await expect(page.getByTestId('stats-loading')).toBeVisible();

    // Wait for stats to load
    await expect(page.getByTestId('stats-loading')).not.toBeVisible();

    // Check last updated timestamp
    await expect(page.getByTestId('stats-updated')).toContainText('Updated');
  });

  test('should handle organization update errors', async ({ page, context }) => {
    // Mock error response
    await context.route('**/api/organizations', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 403,
          json: { error: 'Insufficient permissions' },
        });
      } else {
        route.continue();
      }
    });

    // Try to update organization
    await page.getByRole('button', { name: /edit organization/i }).click();
    await page.getByLabel('Organization Name').fill('New Name');
    await page.getByRole('button', { name: /save changes/i }).click();

    // Check error message
    await expect(page.getByText(/insufficient permissions/i)).toBeVisible();
  });

  test('should show activity timeline', async ({ page }) => {
    // Navigate to activity tab
    await page.getByRole('tab', { name: /activity/i }).click();

    // Check activity timeline
    await expect(page.getByText('Recent Activity')).toBeVisible();

    // Check if activities are displayed
    const activities = await page.getByTestId('activity-item').all();
    expect(activities.length).toBeGreaterThan(0);

    // Check activity details
    const firstActivity = activities[0];
    await expect(firstActivity).toContainText(/ago$/); // Relative time
  });
});
