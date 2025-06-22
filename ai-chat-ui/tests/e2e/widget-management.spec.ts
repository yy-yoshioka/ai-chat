import { test, expect } from '@playwright/test';
import { generateTestUser } from '../fixtures/user';

test.describe('Widget Management Flow', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser();

    // Login as admin user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to admin dashboard
    await page.goto('/admin/default/widgets');
  });

  test('Create → Edit → Delete Widget Flow', async ({ page }) => {
    // Step 1: Create new widget
    await page.click('[data-testid="create-widget-button"]');
    await expect(page.locator('[data-testid="widget-form"]')).toBeVisible();

    // Fill widget form
    await page.fill('input[name="name"]', 'Test Widget');
    await page.fill('input[name="welcomeMessage"]', 'Welcome to our test widget!');
    await page.fill('input[name="placeholder"]', 'Type your message here...');

    // Set theme colors
    await page.fill('input[name="primaryColor"]', '#007bff');
    await page.fill('input[name="secondaryColor"]', '#6c757d');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify widget was created
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      'Widget created successfully'
    );
    await expect(page.locator('[data-testid="widget-list"]')).toContainText('Test Widget');

    // Step 2: Edit the widget
    await page.click('[data-testid="edit-widget-Test Widget"]');
    await expect(page.locator('[data-testid="widget-form"]')).toBeVisible();

    // Update widget name
    await page.fill('input[name="name"]', 'Updated Test Widget');
    await page.fill('input[name="welcomeMessage"]', 'Updated welcome message!');

    // Submit changes
    await page.click('button[type="submit"]');

    // Verify widget was updated
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      'Widget updated successfully'
    );
    await expect(page.locator('[data-testid="widget-list"]')).toContainText('Updated Test Widget');

    // Step 3: Test widget toggle (enable/disable)
    await page.click('[data-testid="toggle-widget-Updated Test Widget"]');
    await expect(page.locator('[data-testid="widget-status-Updated Test Widget"]')).toContainText(
      'Inactive'
    );

    await page.click('[data-testid="toggle-widget-Updated Test Widget"]');
    await expect(page.locator('[data-testid="widget-status-Updated Test Widget"]')).toContainText(
      'Active'
    );

    // Step 4: Copy embed code
    await page.click('[data-testid="copy-embed-Updated Test Widget"]');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Embed code copied');

    // Step 5: Delete the widget
    await page.click('[data-testid="delete-widget-Updated Test Widget"]');

    // Confirm deletion in modal
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify widget was deleted
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      'Widget deleted successfully'
    );
    await expect(page.locator('[data-testid="widget-list"]')).not.toContainText(
      'Updated Test Widget'
    );
  });

  test('Widget form validation', async ({ page }) => {
    await page.click('[data-testid="create-widget-button"]');

    // Test empty form submission
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="name-error"]')).toContainText(
      'Widget name is required'
    );

    // Test invalid color format
    await page.fill('input[name="name"]', 'Test Widget');
    await page.fill('input[name="primaryColor"]', 'invalid-color');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="color-error"]')).toContainText('Invalid color format');

    // Test valid form
    await page.fill('input[name="primaryColor"]', '#007bff');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('Widget preview functionality', async ({ page }) => {
    await page.click('[data-testid="create-widget-button"]');

    // Fill form with preview data
    await page.fill('input[name="name"]', 'Preview Test Widget');
    await page.fill('input[name="welcomeMessage"]', 'Welcome to preview!');
    await page.fill('input[name="primaryColor"]', '#ff6b6b');

    // Verify preview updates in real-time
    await expect(page.locator('[data-testid="widget-preview"]')).toContainText(
      'Welcome to preview!'
    );
    await expect(page.locator('[data-testid="widget-preview"]')).toHaveCSS(
      '--primary-color',
      'rgb(255, 107, 107)'
    );

    // Test theme switching in preview
    await page.selectOption('[data-testid="theme-select"]', 'dark');
    await expect(page.locator('[data-testid="widget-preview"]')).toHaveClass(/dark-theme/);

    await page.selectOption('[data-testid="theme-select"]', 'light');
    await expect(page.locator('[data-testid="widget-preview"]')).toHaveClass(/light-theme/);
  });

  test('Widget analytics integration', async ({ page }) => {
    // Create a widget first
    await page.click('[data-testid="create-widget-button"]');
    await page.fill('input[name="name"]', 'Analytics Test Widget');
    await page.click('button[type="submit"]');

    // Navigate to widget analytics
    await page.click('[data-testid="analytics-Analytics Test Widget"]');

    // Verify analytics page elements
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="unique-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();

    // Test date range filter
    await page.selectOption('[data-testid="date-range-select"]', '7d');
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();

    await page.selectOption('[data-testid="date-range-select"]', '30d');
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
  });
});
