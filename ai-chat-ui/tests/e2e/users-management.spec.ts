import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/org-1/users');
  });

  test('should display users list', async ({ page }) => {
    // Wait for users table to load
    await expect(page.getByRole('table')).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /roles/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();

    // Check if users are displayed
    const rows = await page.getByRole('row').count();
    expect(rows).toBeGreaterThan(1); // Header + at least one user
  });

  test('should filter users by role', async ({ page }) => {
    // Select role filter
    await page.getByLabel('Filter by role').selectOption('owner');

    // Wait for filtered results
    await page.waitForLoadState('networkidle');

    // Check filtered results
    const roleCells = await page.getByTestId('user-role').all();
    for (const cell of roleCells) {
      const text = await cell.textContent();
      expect(text).toContain('Owner');
    }
  });

  test('should search users by email', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder('Search by email or name').fill('admin@');

    // Wait for search results
    await page.waitForLoadState('networkidle');

    // Check search results
    const emailCells = await page.getByTestId('user-email').all();
    for (const cell of emailCells) {
      const text = await cell.textContent();
      expect(text?.toLowerCase()).toContain('admin@');
    }
  });

  test('should paginate users list', async ({ page }) => {
    // Check pagination controls
    await expect(page.getByTestId('pagination')).toBeVisible();

    // Click next page if available
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // Check URL updated
      await expect(page).toHaveURL(/page=2/);

      // Check page indicator
      await expect(page.getByText(/page 2/i)).toBeVisible();
    }
  });

  test('should update user role', async ({ page }) => {
    // Click edit button on first user
    await page.getByRole('button', { name: /edit/i }).first().click();

    // Wait for modal
    await expect(page.getByRole('dialog')).toBeVisible();

    // Change role
    await page.getByLabel('Role').selectOption('editor');

    // Save changes
    await page.getByRole('button', { name: /save/i }).click();

    // Check success message
    await expect(page.getByText(/user updated successfully/i)).toBeVisible();

    // Check role updated in table
    await expect(page.getByTestId('user-role').first()).toContainText('Editor');
  });

  test('should delete user', async ({ page }) => {
    // Count initial users
    const initialCount = (await page.getByRole('row').count()) - 1; // Minus header

    // Click delete button on first user
    await page
      .getByRole('button', { name: /delete/i })
      .first()
      .click();

    // Confirm deletion
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Check success message
    await expect(page.getByText(/user deleted successfully/i)).toBeVisible();

    // Check user count decreased
    const newCount = (await page.getByRole('row').count()) - 1;
    expect(newCount).toBe(initialCount - 1);
  });

  test('should send user invitation', async ({ page }) => {
    // Click invite button
    await page.getByRole('button', { name: /invite user/i }).click();

    // Fill invitation form
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Role').selectOption('viewer');

    // Send invitation
    await page.getByRole('button', { name: /send invitation/i }).click();

    // Check success message
    await expect(page.getByText(/invitation sent successfully/i)).toBeVisible();
  });

  test('should validate invitation form', async ({ page }) => {
    // Click invite button
    await page.getByRole('button', { name: /invite user/i }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: /send invitation/i }).click();

    // Check validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();

    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email');

    // Check email validation
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });
});
