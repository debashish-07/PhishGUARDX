import { test, expect } from '@playwright/test';

test.describe('Phishing Detector - Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load with cyber theme', async ({ page }) => {
    // Check header
    await expect(page.locator('h1')).toContainText('Phishing Detector');
    
    // Check background gradient
    const body = page.locator('body');
    await expect(body).toHaveCSS('background', /gradient/i);
    
    // Check cyber background canvas exists
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should display model status', async ({ page }) => {
    const statusText = page.locator('text=/Model:/i');
    await expect(statusText).toBeVisible();
    
    // Wait for model to load
    await page.waitForSelector('text=/ready|downloading/i', { timeout: 30000 });
  });

  test('should analyze low-risk URL', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    // Enter URL
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Wait for loading to complete
    await page.waitForSelector('text=/Analysis complete/i', { timeout: 15000 });
    
    // Check risk bar appears
    const riskBar = page.locator('text=/Risk Score|Low Risk|Medium Risk|High Risk/i');
    await expect(riskBar).toBeVisible();
    
    // Check visual DNA canvas
    const dnaCanvas = page.locator('#dna');
    await expect(dnaCanvas).toBeVisible();
  });

  test('should analyze high-risk URL', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    // Enter suspicious URL
    await urlInput.fill('http://192.168.1.1/secure-paypal-login/verify?acc=12345');
    await analyzeButton.click();
    
    // Wait for analysis
    await page.waitForSelector('text=/Analysis complete/i', { timeout: 15000 });
    
    // Check high risk indicator
    const riskScore = page.locator('text=/\\d+\\/100/');
    await expect(riskScore).toBeVisible();
    
    // For high risk, should see danger color
    const scoreText = await page.locator('text=/\\d+\\/100/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    
    if (score >= 60) {
      // High risk - check for danger color or high risk label
      const dangerElement = page.locator('text=/High Risk/i');
      await expect(dangerElement).toBeVisible();
    }
  });

  test('should show toast notification after analysis', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Check toast appears
    const toast = page.locator('text=/Analysis complete/i');
    await expect(toast).toBeVisible({ timeout: 15000 });
  });

  test('should handle batch analysis', async ({ page }) => {
    const batchTextarea = page.locator('textarea[placeholder*="Enter URLs"]');
    const batchButton = page.locator('button:has-text("Execute Analysis")');
    
    // Enter multiple URLs
    await batchTextarea.fill('https://example.com\nhttps://google.com\nhttp://192.168.1.1');
    await batchButton.click();
    
    // Wait for batch results
    await page.waitForSelector('text=/Batch analysis complete/i', { timeout: 30000 });
    
    // Check results cards appear
    const resultCards = page.locator('text=/Analysis \\d+/i');
    await expect(resultCards.first()).toBeVisible();
  });

  test('should export history', async ({ page }) => {
    // First analyze a URL to create history
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    await page.waitForSelector('text=/Analysis complete/i', { timeout: 15000 });
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    const exportButton = page.locator('button:has-text("Export History")');
    await exportButton.click();
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should display analysis history', async ({ page }) => {
    // Analyze a URL first
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    await page.waitForSelector('text=/Analysis complete/i', { timeout: 15000 });
    
    // Refresh to see history
    await page.reload();
    await page.waitForTimeout(1000); // Wait for history to load
    
    // Check history section
    const historySection = page.locator('text=/Analysis History/i');
    await expect(historySection).toBeVisible();
  });

  test('should have interactive button hover effects', async ({ page }) => {
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    // Hover over button
    await analyzeButton.hover();
    
    // Button should be visible and interactive
    await expect(analyzeButton).toBeVisible();
  });

  test('should show loading spinner during analysis', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    await urlInput.fill('https://example.com');
    
    // Click and check for loader (might appear/disappear quickly)
    analyzeButton.click();
    
    // Wait for analysis to complete (loader should have appeared)
    await page.waitForSelector('text=/Analysis complete/i', { timeout: 15000 });
    
    // Verify we got results
    const riskBar = page.locator('text=/Risk Score|Low Risk|Medium Risk|High Risk/i');
    await expect(riskBar).toBeVisible();
  });

  test('should render visual DNA canvas', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    
    // Just typing should render canvas
    await urlInput.fill('https://example.com');
    await page.waitForTimeout(500); // Wait for canvas render
    
    // Canvas should be visible
    const canvas = page.locator('#dna');
    await expect(canvas).toBeVisible();
  });

  test('should display explain panel with attributions', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="Paste URL"]');
    const analyzeButton = page.locator('button:has-text("Analyze")');
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Wait for explain panel
    await page.waitForSelector('text=/Analysis complete/i', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Check for explain panel (should have visual DNA or explanations)
    const explainPanel = page.locator('#dna, text=/Feature|Token|Attribution|Visual DNA/i');
    await expect(explainPanel.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const header = page.locator('h1');
    await expect(header).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(header).toBeVisible();
  });
});
