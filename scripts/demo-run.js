const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = process.env.TARGET_URL || `http://localhost:${process.env.PORT || 3000}`;
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const urlInput = await page.locator('input[type="text"]').first();
  const analyzeButton = await page.locator('button:has-text("Analyze")').first();

  const demoUrl = 'https://demo.example/phishing-test';
  console.log('Filling URL:', demoUrl);
  await urlInput.fill(demoUrl);
  console.log('Clicking Analyze');
  await analyzeButton.click();

  console.log('Waiting for analysis to complete...');
  try {
    await page.locator('[data-testid="analysis-complete-badge"]').waitFor({ timeout: 30000 });
    console.log('Analysis complete badge appeared');
  } catch (e) {
    console.warn('Timed out waiting for analysis complete badge');
  }

  // Verify ledger viewer
  try {
    await page.locator('text=Local Trust Ledger').waitFor({ timeout: 10000 });
    const found = await page.locator(`text=${demoUrl}`).first().isVisible();
    console.log('Ledger entry visible:', found);
  } catch (e) {
    console.warn('Ledger viewer or entry not found', e);
  }

  await browser.close();
  console.log('Done');
})();
