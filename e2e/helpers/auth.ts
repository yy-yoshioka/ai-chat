import { Page } from '@playwright/test';

export async function login(page: Page, email: string = 'test@example.com', password: string = 'Test123!') {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect after successful login
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

export async function logout(page: Page) {
  await page.click('button[aria-label="User menu"]');
  await page.click('text=ログアウト');
  await page.waitForURL('**/login');
}

export async function setupAuthenticatedUser(page: Page) {
  // This would typically seed a test user in the database
  // For now, we'll just use the login helper
  await login(page);
}