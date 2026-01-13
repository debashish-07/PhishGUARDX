import { test, expect } from '@playwright/test';
import { waitForAnalysisReady } from '../tests/e2e-helpers';

test.describe('New Visualizations - Audio Spectrum & Heatmap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should render audio spectrum chart after analysis', async ({ page }) => {
    // Enter a test URL
    const urlInput = page.locator('input[type="text"]');
    await urlInput.fill('https://suspicious-phishing.com/login');
    
    // Click analyze button
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    await analyzeButton.click();
    
    // Wait for dashboard ready marker then audio section heading
      await waitForAnalysisReady(page);
    const audioHeading = page.locator('text=Audio Spectrum Analysis');
    await audioHeading.scrollIntoViewIfNeeded();
    await expect(audioHeading).toBeVisible({ timeout: 20000 });

    // Check for spectrum canvas (the 500x300 one)
    const spectrumCanvas = page.locator('canvas[width="500"][height="300"]');
    await spectrumCanvas.first().scrollIntoViewIfNeeded();
    await expect(spectrumCanvas.first()).toBeVisible({ timeout: 20000 });

    // Visible analysis complete badge
    await expect(page.locator('[data-testid="analysis-complete-badge"]')).toBeVisible({ timeout: 15000 });
  });

  test('should render URL heatmap after analysis', async ({ page }) => {
    // Enter a test URL
    const urlInput = page.locator('input[type="text"]');
    await urlInput.fill('https://example-safe.com');
    
    // Click analyze button
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    await analyzeButton.click();
    
    // Wait for dashboard ready marker then heatmap section heading
      await waitForAnalysisReady(page);
    const heatmapHeading = page.locator('text=Character-Level Risk Attribution');
    await heatmapHeading.scrollIntoViewIfNeeded();
    await expect(heatmapHeading).toBeVisible({ timeout: 20000 });
    
    // Check for character display
    const charDisplay = page.locator('text=https');
    await charDisplay.first().scrollIntoViewIfNeeded();
    await expect(charDisplay.first()).toBeVisible({ timeout: 20000 });
  });

  test('should show heatmap color legend', async ({ page }) => {
    // Enter a URL
    const urlInput = page.locator('input[type="text"]');
    await urlInput.fill('https://test.com');
    
    // Click analyze
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    await analyzeButton.click();
    
      await waitForAnalysisReady(page);
    // Check for legend items - use more specific selectors
    await page.locator('text=Safe').filter({ hasText: '(<33%)' }).scrollIntoViewIfNeeded();
    await expect(page.locator('text=Safe').filter({ hasText: '(<33%)' })).toBeVisible({ timeout: 20000 });
    await page.locator('text=Medium').filter({ hasText: '(33-67%)' }).scrollIntoViewIfNeeded();
    await expect(page.locator('text=Medium').filter({ hasText: '(33-67%)' })).toBeVisible({ timeout: 20000 });
    await page.locator('text=Risky').filter({ hasText: '(>67%)' }).scrollIntoViewIfNeeded();
    await expect(page.locator('text=Risky').filter({ hasText: '(>67%)' })).toBeVisible({ timeout: 20000 });
  });

  test('should show heatmap statistics', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]');
    await urlInput.fill('https://phishing-site.com/verify-account');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    await analyzeButton.click();
    
    // Wait for dashboard ready marker, then check for statistics section by looking for specific stat values
      await waitForAnalysisReady(page);
    const safeStatLabel = page.locator('text=Safe <33%');
    await safeStatLabel.scrollIntoViewIfNeeded();
    await expect(safeStatLabel).toBeVisible({ timeout: 20000 });
  });
});
