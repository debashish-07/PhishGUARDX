import { expect, Page } from '@playwright/test';

export async function waitForAnalysisReady(page: Page, timeout = 15000) {
  await expect(page.locator('[data-testid="dashboard-ready"]')).toBeVisible({ timeout });
  await expect(page.locator('[data-testid="analysis-complete"]')).toBeVisible({ timeout });
  await expect(page.locator('[data-testid="analysis-complete-badge"]')).toBeVisible({ timeout });
}
