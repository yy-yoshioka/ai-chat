import { test as setup, expect } from '@playwright/test';
import { generateTestUser } from '../fixtures/user';

const authFile = 'tests/fixtures/.auth/user.json';

setup('authenticate user', async ({ page }) => {
  const testUser = generateTestUser();

  // サインアップ
  await page.goto('/signup');

  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="password"]', testUser.password);
  await page.fill('input[name="organizationName"]', testUser.organizationName);

  await page.click('button[type="submit"]');

  // ログイン成功をチェック
  await expect(page).toHaveURL('/profile');

  // 認証状態を保存
  await page.context().storageState({ path: authFile });
});
