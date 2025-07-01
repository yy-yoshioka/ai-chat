import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Knowledge Base Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should upload a file to knowledge base', async ({ page }) => {
    // Navigate to knowledge base
    await page.goto('/dashboard/knowledge-base');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('ナレッジベース');

    // Select a widget
    await page.selectOption('select[name="widgetId"]', { index: 1 });

    // Upload a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=ファイルをドラッグ&ドロップ');
    const fileChooser = await fileChooserPromise;
    
    // Create a test file
    await fileChooser.setFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a test document for the knowledge base.')
    });

    // Wait for upload progress
    await expect(page.locator('text=アップロード中')).toBeVisible();
    
    // Wait for upload completion
    await expect(page.locator('text=アップロード完了')).toBeVisible({ timeout: 30000 });

    // Verify file appears in the list
    await expect(page.locator('text=test-document.txt')).toBeVisible();
  });

  test('should delete a knowledge base item', async ({ page }) => {
    // Navigate to knowledge base
    await page.goto('/dashboard/knowledge-base');
    
    // Wait for items to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Find and click delete button for first item
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('button[aria-label="削除"]').click();

    // Confirm deletion
    await page.click('button:has-text("削除する")');

    // Wait for toast or success message
    await expect(page.locator('text=削除しました')).toBeVisible();
  });

  test('should filter knowledge base items by status', async ({ page }) => {
    // Navigate to knowledge base
    await page.goto('/dashboard/knowledge-base');

    // Select "processed" status filter
    await page.selectOption('select[name="status"]', 'processed');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    // Verify all visible items have processed status
    const statusBadges = await page.locator('td:has-text("処理済み")').count();
    const totalRows = await page.locator('table tbody tr').count();
    
    expect(statusBadges).toBe(totalRows);
  });

  test('should search knowledge base items', async ({ page }) => {
    // Navigate to knowledge base
    await page.goto('/dashboard/knowledge-base');

    // Enter search term
    await page.fill('input[placeholder*="検索"]', 'test');
    
    // Wait for search results
    await page.waitForTimeout(500);

    // Verify results contain search term
    const results = await page.locator('table tbody tr').count();
    if (results > 0) {
      const firstResult = await page.locator('table tbody tr').first().textContent();
      expect(firstResult?.toLowerCase()).toContain('test');
    }
  });

  test('should show error for invalid file type', async ({ page }) => {
    // Navigate to knowledge base
    await page.goto('/dashboard/knowledge-base');

    // Select a widget
    await page.selectOption('select[name="widgetId"]', { index: 1 });

    // Try to upload invalid file type
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=ファイルをドラッグ&ドロップ');
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('Invalid file')
    });

    // Verify error message
    await expect(page.locator('text=対応していないファイル形式です')).toBeVisible();
  });

  test('should paginate through knowledge base items', async ({ page }) => {
    // Navigate to knowledge base
    await page.goto('/dashboard/knowledge-base');

    // Wait for pagination controls
    await page.waitForSelector('[aria-label="ページネーション"]', { timeout: 10000 });

    // Check if next page button exists and is enabled
    const nextButton = page.locator('button[aria-label="次のページ"]');
    if (await nextButton.isEnabled()) {
      // Click next page
      await nextButton.click();

      // Verify page changed
      await expect(page.locator('text=ページ 2')).toBeVisible();

      // Go back to first page
      await page.click('button[aria-label="前のページ"]');
      await expect(page.locator('text=ページ 1')).toBeVisible();
    }
  });
});