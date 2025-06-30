import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/admin/org-1/dashboard');
  });

  test('should display dashboard metrics', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Check if metrics are displayed
    await expect(page.getByText('Total Chats')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Avg Response Time')).toBeVisible();
    await expect(page.getByText('Error Rate')).toBeVisible();

    // Check if values are displayed
    await expect(page.getByTestId('total-chats-value')).toBeVisible();
    await expect(page.getByTestId('active-users-value')).toBeVisible();
    await expect(page.getByTestId('avg-response-time-value')).toBeVisible();
    await expect(page.getByTestId('error-rate-value')).toBeVisible();
  });

  test('should refresh dashboard data', async ({ page }) => {
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();

    // Check loading state
    await expect(page.getByTestId('loading-spinner')).toBeVisible();

    // Wait for data to load
    await expect(page.getByTestId('loading-spinner')).not.toBeVisible();
    
    // Check timestamp updated
    const timestamp = await page.getByTestId('last-updated').textContent();
    expect(timestamp).toContain('Last updated:');
  });

  test('should handle dashboard errors gracefully', async ({ page, context }) => {
    // Intercept API call and return error
    await context.route('**/api/dashboard', (route) => {
      route.fulfill({
        status: 500,
        json: { error: 'Server error' },
      });
    });

    // Reload page
    await page.reload();

    // Check error message
    await expect(page.getByText(/Failed to load dashboard/i)).toBeVisible();
    
    // Check retry button
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  });

  test('should navigate to other sections from dashboard', async ({ page }) => {
    // Click on Users link
    await page.getByRole('link', { name: /users/i }).click();
    await expect(page).toHaveURL(/\/users$/);

    // Go back to dashboard
    await page.goBack();
    
    // Click on Reports link
    await page.getByRole('link', { name: /reports/i }).click();
    await expect(page).toHaveURL(/\/reports$/);
  });
});