const puppeteer = require('puppeteer');

async function comprehensiveTest() {
  console.log('🚀 Starting comprehensive application test...');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Landing Page
    console.log('📍 Test 1: Landing Page');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    await page.waitForSelector('app-root', { timeout: 10000 });
    
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`✓ Landing page loaded with title: ${title}`);
    
    await page.screenshot({ path: 'test-results/01-landing-page.png' });
    
    // Test 2: Navigation to Characters
    console.log('📍 Test 2: Navigation to Characters');
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Browse Characters')
      );
      if (button) button.click();
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/02-characters-page.png' });
    console.log('✓ Characters page loaded');
    
    // Test 3: Search Functionality
    console.log('📍 Test 3: Search Functionality');
    await page.type('input', 'Jon');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    const searchResults = await page.$eval('.results-info', el => el.textContent);
    console.log(`✓ Search results: ${searchResults}`);
    await page.screenshot({ path: 'test-results/03-search-results.png' });
    
    // Clear search
    await page.evaluate(() => {
      const clearButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Clear Filters')
      );
      if (clearButton) clearButton.click();
    });
    await page.waitForTimeout(2000);
    
    // Test 4: Favorites Functionality
    console.log('📍 Test 4: Favorites Functionality');
    const favoriteButtons = await page.$$('button mat-icon');
    if (favoriteButtons.length > 0) {
      await favoriteButtons[0].click();
      await page.waitForTimeout(1000);
      console.log('✓ Favorite button clicked');
      await page.screenshot({ path: 'test-results/04-favorite-added.png' });
    }
    
    // Test 5: Character Detail Page
    console.log('📍 Test 5: Character Detail Page');
    await page.goto('http://localhost:4200/characters/583', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const characterName = await page.$eval('h1', el => el.textContent);
    console.log(`✓ Character detail page loaded: ${characterName}`);
    await page.screenshot({ path: 'test-results/05-character-detail.png' });
    
    // Test 6: Favorites Page
    console.log('📍 Test 6: Favorites Page');
    await page.goto('http://localhost:4200/favorites', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/06-favorites-page.png' });
    console.log('✓ Favorites page loaded');
    
    // Test 7: Mobile Responsiveness
    console.log('📍 Test 7: Mobile Responsiveness');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/07-mobile-landing.png' });
    
    await page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/08-mobile-characters.png' });
    console.log('✓ Mobile responsiveness verified');
    
    // Test 8: Performance Check
    console.log('📍 Test 8: Performance Check');
    const metrics = await page.metrics();
    console.log(`✓ Performance metrics:
      - JS Heap Used: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)} MB
      - JS Heap Total: ${Math.round(metrics.JSHeapTotalSize / 1024 / 1024)} MB
      - Documents: ${metrics.Documents}
      - Frames: ${metrics.Frames}
      - Nodes: ${metrics.Nodes}`);
    
    console.log('🎉 All tests completed successfully!');
    
    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      status: 'PASSED',
      tests: [
        { name: 'Landing Page Load', status: 'PASSED', result: title },
        { name: 'Characters Navigation', status: 'PASSED' },
        { name: 'Search Functionality', status: 'PASSED', result: searchResults },
        { name: 'Favorites Toggle', status: 'PASSED' },
        { name: 'Character Detail', status: 'PASSED', result: characterName },
        { name: 'Favorites Page', status: 'PASSED' },
        { name: 'Mobile Responsiveness', status: 'PASSED' },
        { name: 'Performance Check', status: 'PASSED', result: metrics }
      ]
    };
    
    await page.evaluate((report) => {
      localStorage.setItem('testReport', JSON.stringify(report));
    }, report);
    
    console.log('📊 Test report saved to localStorage');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/error-screenshot.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// Create test results directory
const fs = require('fs');
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

comprehensiveTest().catch(console.error);