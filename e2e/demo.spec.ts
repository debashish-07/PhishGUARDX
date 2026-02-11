import { test, expect } from '@playwright/test';

test('demo: scan creates ledger entry and viewer updates', async ({ page }) => {
  // Navigate directly to the preview running on port 3001
  await page.goto('http://localhost:3001');

  const urlInput = page.locator('input[type="text"]').first();
  const analyzeButton = page.locator('button:has-text("Analyze")').first();

  // Fill a sample demo URL and run analysis
  const demoUrl = 'https://demo.example/phishing-test';
  await expect(urlInput).toBeVisible({ timeout: 5000 });
  await urlInput.fill(demoUrl);
  await analyzeButton.click();

  // Wait for the analysis-complete badge to appear (analysis finished)
  await page.locator('[data-testid="analysis-complete-badge"]').waitFor({ timeout: 30000 });

  // Ensure the Trust Ledger viewer is visible
  const ledgerHeading = page.locator('text=Local Trust Ledger');
  await expect(ledgerHeading).toBeVisible({ timeout: 10000 });

  // The new ledger entry should contain the demo URL
  const entry = page.locator(`text=${demoUrl}`);
  await expect(entry).toBeVisible({ timeout: 15000 });
});
