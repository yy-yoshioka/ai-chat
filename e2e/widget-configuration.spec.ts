import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Widget Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create a new widget', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');
    
    // Click create button
    await page.click('button:has-text("新規ウィジェット")');

    // Fill in widget details
    await page.fill('input[name="name"]', 'Test Widget');
    await page.selectOption('select[name="companyId"]', { index: 1 });
    await page.fill('input[name="themeColor"]', '#FF5733');
    await page.fill('textarea[name="welcomeMessage"]', 'Welcome to our support chat!');
    await page.fill('input[name="placeholderText"]', 'Type your question here...');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=ウィジェットを作成しました')).toBeVisible();

    // Verify widget appears in list
    await expect(page.locator('text=Test Widget')).toBeVisible();
  });

  test('should edit widget settings', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Click on first widget to edit
    await page.click('table tbody tr:first-child');

    // Update widget name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Widget Name');

    // Change theme color
    await page.fill('input[name="themeColor"]', '#00FF00');

    // Save changes
    await page.click('button:has-text("保存")');

    // Wait for success message
    await expect(page.locator('text=更新しました')).toBeVisible();
  });

  test('should toggle widget status', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Find first widget's status toggle
    const firstRow = page.locator('table tbody tr').first();
    const statusToggle = firstRow.locator('button[aria-label*="ステータス"]');

    // Get initial status
    const initialStatus = await statusToggle.textContent();

    // Toggle status
    await statusToggle.click();

    // Wait for status update
    await page.waitForTimeout(500);

    // Verify status changed
    const newStatus = await statusToggle.textContent();
    expect(newStatus).not.toBe(initialStatus);
  });

  test('should copy widget key', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Click on first widget
    await page.click('table tbody tr:first-child');

    // Click copy widget key button
    await page.click('button[aria-label="ウィジェットキーをコピー"]');

    // Verify success message
    await expect(page.locator('text=コピーしました')).toBeVisible();
  });

  test('should preview widget', async ({ page, context }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Click on first widget
    await page.click('table tbody tr:first-child');

    // Click preview button
    const [previewPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button:has-text("プレビュー")')
    ]);

    // Wait for preview to load
    await previewPage.waitForLoadState();

    // Verify preview page contains widget
    await expect(previewPage.locator('iframe#ai-chat-widget')).toBeVisible();

    // Close preview
    await previewPage.close();
  });

  test('should show widget installation code', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Click on first widget
    await page.click('table tbody tr:first-child');

    // Click installation guide tab/button
    await page.click('text=導入ガイド');

    // Verify installation code is displayed
    await expect(page.locator('pre:has-text("<script")')).toBeVisible();
    await expect(page.locator('text=data-widget-key=')).toBeVisible();
  });

  test('should delete widget', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Get initial widget count
    const initialCount = await page.locator('table tbody tr').count();

    // Click on first widget
    await page.click('table tbody tr:first-child');

    // Click delete button
    await page.click('button:has-text("削除")');

    // Confirm deletion in dialog
    await page.click('button:has-text("削除する")');

    // Wait for deletion
    await expect(page.locator('text=削除しました')).toBeVisible();

    // Verify widget count decreased
    const newCount = await page.locator('table tbody tr').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should filter widgets by status', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Select active widgets filter
    await page.selectOption('select[name="status"]', 'active');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify all visible widgets are active
    const statusElements = await page.locator('td:has-text("有効")').count();
    const totalRows = await page.locator('table tbody tr').count();
    
    if (totalRows > 0) {
      expect(statusElements).toBe(totalRows);
    }
  });

  test('should search widgets', async ({ page }) => {
    // Navigate to widgets page
    await page.goto('/dashboard/widgets');

    // Enter search term
    await page.fill('input[placeholder*="検索"]', 'test');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify results
    const results = await page.locator('table tbody tr').count();
    if (results > 0) {
      const firstResult = await page.locator('table tbody tr').first().textContent();
      expect(firstResult?.toLowerCase()).toContain('test');
    }
  });
});