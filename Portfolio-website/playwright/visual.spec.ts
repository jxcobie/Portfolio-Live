import { test, expect } from '@playwright/test';

test.describe('Visual regression', () => {
  test('Home page snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Projects page snapshot', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('projects.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
