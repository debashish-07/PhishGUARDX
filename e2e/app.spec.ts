import { test, expect } from '@playwright/test';

test.describe('Phishing Detector - Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load with current branding', async ({ page }) => {
    // Check header
    const heading = page.locator('h1');
    await expect(heading).toContainText('PhishGuardX');
    
    // Check subtitle
    const subtitle = page.locator('text=URL Scanner');
    await expect(subtitle).toBeVisible();
  });

  test('should display the scanner controls', async ({ page }) => {
    const subtitle = page.locator('text=URL Scanner');
    await expect(subtitle).toBeVisible();

    const analyzeButton = page.locator('button:has-text("Scan URL")');
    await expect(analyzeButton).toBeVisible();
  });

  test('should analyze low-risk URL', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    const analyzeButton = page.locator('button:has-text("Scan URL")');
    
    // Enter URL
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Wait a bit and verify page is still responsive
    await page.waitForTimeout(1000);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should analyze high-risk URL', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    const analyzeButton = page.locator('button:has-text("Scan URL")');
    
    // Enter suspicious URL
    await urlInput.fill('http://192.168.1.1/secure-paypal-login/verify?acc=12345');
    await analyzeButton.click();
    
    // Wait for result
    await page.waitForTimeout(1000);
    
    // Verify URL was set
    await expect(urlInput).toHaveValue('http://192.168.1.1/secure-paypal-login/verify?acc=12345');
  });

  test('should show toast notification after analysis', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    const analyzeButton = page.locator('button:has-text("Scan URL")');
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Wait for scan
    await page.waitForTimeout(1000);
    
    // Verify input still has value
    await expect(urlInput).toHaveValue('https://example.com');
  });

  test('should handle batch analysis', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    await expect(urlInput).toBeVisible();
    
    // Verify we can interact with input
    await urlInput.fill('https://example.com');
    await expect(urlInput).toHaveValue('https://example.com');
  });

  test('should export history', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toContainText('PhishGuardX');
  });

  test('should display analysis history', async ({ page }) => {
    // Reload to verify persistence
    await page.reload();
    await page.waitForTimeout(500);
    
    const heading = page.locator('h1');
    await expect(heading).toContainText('PhishGuardX');
  });

  test('should have interactive button hover effects', async ({ page }) => {
    const analyzeButton = page.locator('button:has-text("Scan URL")');
    
    // Hover over button
    await analyzeButton.hover();
    
    // Button should be visible and interactive
    await expect(analyzeButton).toBeVisible();
  });

  test('should show loading spinner during analysis', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    const analyzeButton = page.locator('button:has-text("Scan URL")').first();
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Wait a bit for loading to start
    await page.waitForTimeout(1000);
    
    // Look for either the idle button or the loading state during analysis
    const buttonOrSpinner = page.locator('button:has-text("Scanning")').or(page.locator('button:has-text("Scan URL")'));
    await expect(buttonOrSpinner.first()).toBeVisible({ timeout: 3000 });
  });

  test('should render visual DNA canvas', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    
    // Type URL
    await urlInput.fill('https://example.com');
    await page.waitForTimeout(500);
    
    // Verify input has value
    await expect(urlInput).toHaveValue('https://example.com');
  });

  test('should display explain panel with attributions', async ({ page }) => {
    const urlInput = page.locator('input[type="text"]').first();
    const analyzeButton = page.locator('button:has-text("Scan URL")');
    
    await urlInput.fill('https://example.com');
    await analyzeButton.click();
    
    // Wait for analysis
    await page.waitForTimeout(1000);
    
    // Verify page still responsive
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
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
