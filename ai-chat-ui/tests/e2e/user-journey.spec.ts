import { test, expect } from '@playwright/test';
import { generateTestUser } from '../fixtures/user';

test.describe('User Journey: Sign-up → Embed → First Message', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(() => {
    testUser = generateTestUser();
  });

  test('Complete user journey from signup to first message', async ({ page, context }) => {
    // Step 1: Sign up
    await page.goto('/signup');

    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="organizationName"]', testUser.organizationName);

    await page.click('button[type="submit"]');

    // Verify redirect to profile after signup
    await expect(page).toHaveURL('/profile');

    // Step 2: Navigate to embed page
    await page.goto('/embed');

    // Wait for embed snippet to be generated
    await expect(page.locator('[data-testid="embed-snippet"]')).toBeVisible();

    // Copy embed code
    const embedCode = await page.locator('[data-testid="embed-snippet"]').textContent();
    expect(embedCode).toContain('<script');

    // Step 3: Test the widget in a separate context
    const widgetPage = await context.newPage();

    // Create a test HTML page with the widget
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Widget</title>
      </head>
      <body>
        <h1>Test Page</h1>
        <div id="chat-widget-container"></div>
        ${embedCode}
      </body>
      </html>
    `;

    await widgetPage.setContent(testHtml);

    // Step 4: Wait for widget to load and interact with it
    await expect(widgetPage.locator('[data-testid="chat-widget"]')).toBeVisible();

    // Click on the widget to open it
    await widgetPage.click('[data-testid="chat-widget-trigger"]');

    // Verify chat interface is open
    await expect(widgetPage.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Step 5: Send the first message
    const messageInput = widgetPage.locator('[data-testid="message-input"]');
    await messageInput.fill('Hello, this is my first message!');

    await widgetPage.click('[data-testid="send-button"]');

    // Verify message was sent
    await expect(widgetPage.locator('[data-testid="message-bubble"]')).toContainText(
      'Hello, this is my first message!'
    );

    // Step 6: Verify response is received
    await expect(widgetPage.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 10000 });

    // Close widget page
    await widgetPage.close();

    // Step 7: Verify analytics in admin dashboard
    await page.goto('/admin');

    // Check if the message count has increased
    await expect(page.locator('[data-testid="message-count"]')).toBeVisible();

    // Verify the conversation appears in the dashboard
    await expect(page.locator('[data-testid="conversation-list"]')).toContainText(
      'Hello, this is my first message!'
    );
  });

  test('Widget customization and theme switching', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Navigate to widget customization
    await page.goto('/widgets');

    // Test theme switching
    await page.click('[data-testid="theme-dark"]');
    await expect(page.locator('[data-testid="widget-preview"]')).toHaveClass(/dark-theme/);

    await page.click('[data-testid="theme-light"]');
    await expect(page.locator('[data-testid="widget-preview"]')).toHaveClass(/light-theme/);

    // Test brand color customization
    await page.fill('[data-testid="brand-color-input"]', '#ff6b6b');
    await expect(page.locator('[data-testid="widget-preview"]')).toHaveCSS(
      '--brand-color',
      'rgb(255, 107, 107)'
    );

    // Save changes
    await page.click('[data-testid="save-customization"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('Error handling and validation', async ({ page }) => {
    // Test signup with invalid email
    await page.goto('/signup');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="organizationName"]', testUser.organizationName);

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid email address'
    );

    // Test password too short
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', '123');

    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Password must be at least'
    );
  });
});
