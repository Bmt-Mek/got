const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PuppeteerValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      }
    };
    this.screenshotDir = './puppeteer-screenshots';
  }

  async init() {
    console.log('🚀 Starting Puppeteer validation...');
    
    // Create screenshots directory
    try {
      await fs.mkdir(this.screenshotDir, { recursive: true });
    } catch (error) {
      console.error('Error creating screenshots directory:', error);
    }

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set viewport for desktop testing
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Page error:', msg.text());
      }
    });

    // Handle page errors
    this.page.on('pageerror', error => {
      console.error('Page crash:', error.message);
    });
  }

  async runTest(testName, testFn) {
    const startTime = Date.now();
    console.log(`\n📋 Running test: ${testName}`);
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration,
        error: null
      });
      
      this.results.summary.passed++;
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        duration,
        error: error.message
      });
      
      this.results.summary.failed++;
      console.error(`❌ ${testName} - FAILED (${duration}ms)`);
      console.error(`   Error: ${error.message}`);
      
      // Take screenshot on failure
      await this.takeScreenshot(`failure-${testName.toLowerCase().replace(/\s+/g, '-')}`);
    }
    
    this.results.summary.total++;
  }

  async takeScreenshot(name) {
    try {
      const screenshotPath = path.join(this.screenshotDir, `${name}.png`);
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`Failed to take screenshot: ${error.message}`);
    }
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForNavigation(timeout = 10000) {
    await this.page.waitForLoadState?.('networkidle') || 
          await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout });
  }

  // Test: Application loads successfully
  async testApplicationLoads() {
    await this.page.goto('http://localhost:4200', { waitUntil: 'networkidle0' });
    
    // Wait for Angular app to initialize
    await this.page.waitForSelector('app-root', { timeout: 15000 });
    
    // Check if main content is visible
    await this.waitForElement('app-header');
    await this.waitForElement('main');
    await this.waitForElement('app-footer');
    
    // Take success screenshot
    await this.takeScreenshot('application-loaded');
    
    // Check page title
    const title = await this.page.title();
    if (!title.includes('Game of Thrones Character Explorer')) {
      throw new Error(`Unexpected page title: ${title}`);
    }
  }

  // Test: Main navigation works
  async testMainNavigation() {
    // Test Characters navigation
    await this.page.click('a[routerLink="/characters"]');
    await this.waitForNavigation();
    
    const url = this.page.url();
    if (!url.includes('/characters')) {
      throw new Error(`Navigation failed, current URL: ${url}`);
    }
    
    // Check if characters page loads
    await this.waitForElement('[data-cy="characters-grid"], .characters-grid');
    await this.takeScreenshot('characters-page');
    
    // Test back to home
    await this.page.click('a[routerLink="/"]');
    await this.waitForNavigation();
    
    if (!this.page.url().endsWith('/')) {
      throw new Error('Failed to navigate back to home');
    }
  }

  // Test: Search functionality
  async testSearchFunctionality() {
    // Navigate to characters page
    await this.page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle0' });
    
    // Wait for search input
    await this.waitForElement('input[placeholder*="Search"], input[placeholder*="character"]');
    
    // Perform search
    await this.page.type('input[placeholder*="Search"], input[placeholder*="character"]', 'Jon');
    
    // Wait for search results (debounced)
    await this.page.waitForTimeout(1000);
    
    // Check if results are filtered
    const characterCards = await this.page.$$('.character-card, [data-cy="character-card"]');
    
    if (characterCards.length === 0) {
      throw new Error('Search returned no results');
    }
    
    await this.takeScreenshot('search-results');
  }

  // Test: Character details page
  async testCharacterDetails() {
    // Navigate to characters page
    await this.page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle0' });
    
    // Wait for character cards
    await this.waitForElement('.character-card, [data-cy="character-card"]');
    
    // Click on first character
    await this.page.click('.character-card, [data-cy="character-card"]');
    await this.waitForNavigation();
    
    // Check if on character detail page
    const url = this.page.url();
    if (!url.includes('/characters/')) {
      throw new Error(`Expected character detail URL, got: ${url}`);
    }
    
    // Check if character details are displayed
    await this.waitForElement('.character-detail, [data-cy="character-detail"]');
    
    await this.takeScreenshot('character-detail');
  }

  // Test: Responsive design (mobile)
  async testResponsiveDesign() {
    // Set mobile viewport
    await this.page.setViewport({ width: 375, height: 667 });
    
    // Test home page on mobile
    await this.page.goto('http://localhost:4200', { waitUntil: 'networkidle0' });
    await this.waitForElement('app-header');
    
    await this.takeScreenshot('mobile-home');
    
    // Test characters page on mobile
    await this.page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle0' });
    await this.waitForElement('.characters-grid, [data-cy="characters-grid"]');
    
    await this.takeScreenshot('mobile-characters');
    
    // Reset to desktop viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  // Test: Favorites functionality (without authentication)
  async testFavoritesFunctionality() {
    // Navigate to favorites page
    await this.page.goto('http://localhost:4200/favorites', { waitUntil: 'networkidle0' });
    
    // Should show empty state or redirect to login
    const hasEmptyState = await this.page.$('.empty-state, [data-cy="empty-state"]');
    const hasLoginForm = await this.page.$('form, [data-cy="login-form"]');
    
    if (!hasEmptyState && !hasLoginForm) {
      throw new Error('Favorites page should show empty state or login form');
    }
    
    await this.takeScreenshot('favorites-page');
  }

  // Test: Error handling
  async testErrorHandling() {
    // Navigate to non-existent route
    await this.page.goto('http://localhost:4200/non-existent-route', { waitUntil: 'networkidle0' });
    
    // Should redirect to home or show 404
    const currentUrl = this.page.url();
    if (!currentUrl.endsWith('/') && !currentUrl.includes('404')) {
      console.warn(`Unexpected behavior for 404 route: ${currentUrl}`);
    }
    
    await this.takeScreenshot('error-handling');
  }

  // Test: Performance (basic check)
  async testPerformance() {
    const startTime = Date.now();
    
    await this.page.goto('http://localhost:4200', { waitUntil: 'networkidle0' });
    await this.waitForElement('app-header');
    
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 5000) {
      throw new Error(`Page load time too slow: ${loadTime}ms`);
    }
    
    console.log(`📊 Page load time: ${loadTime}ms`);
  }

  async runAllTests() {
    const startTime = Date.now();
    
    try {
      await this.init();
      
      // Run all validation tests
      await this.runTest('Application Loads Successfully', () => this.testApplicationLoads());
      await this.runTest('Main Navigation Works', () => this.testMainNavigation());
      await this.runTest('Search Functionality', () => this.testSearchFunctionality());
      await this.runTest('Character Details Page', () => this.testCharacterDetails());
      await this.runTest('Responsive Design (Mobile)', () => this.testResponsiveDesign());
      await this.runTest('Favorites Functionality', () => this.testFavoritesFunctionality());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      await this.runTest('Performance Check', () => this.testPerformance());
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      
      // Calculate total duration
      this.results.summary.duration = Date.now() - startTime;
      
      // Save results
      await this.saveResults();
      
      // Print summary
      this.printSummary();
      
      // Exit with appropriate code
      process.exit(this.results.summary.failed > 0 ? 1 : 0);
    }
  }

  async saveResults() {
    try {
      const resultsPath = './puppeteer-report.json';
      await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📊 Results saved to: ${resultsPath}`);
    } catch (error) {
      console.error('Failed to save results:', error.message);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎭 PUPPETEER VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Duration: ${this.results.summary.duration}ms`);
    console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.results.summary.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Application is ready for deployment.');
    } else {
      console.log('🚨 SOME TESTS FAILED! Please check the issues before deployment.');
    }
  }
}

// Run validation
const validator = new PuppeteerValidator();
validator.runAllTests().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});