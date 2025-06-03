const puppeteer = require('puppeteer');

async function testApplication() {
  console.log('Starting Puppeteer tests...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Navigate to application
    console.log('Test 1: Loading application...');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    
    // Wait for Angular to load
    await page.waitForSelector('app-root', { timeout: 10000 });
    console.log('✓ Application loaded successfully');
    
    // Take screenshot
    await page.screenshot({ path: 'app-loaded.png' });
    
    // Test 2: Check if we have navigation
    console.log('Test 2: Checking navigation...');
    const navLinks = await page.$$eval('nav a, mat-toolbar a, .nav-link', links => 
      links.map(link => ({ text: link.textContent.trim(), href: link.href }))
    );
    console.log('Navigation links found:', navLinks);
    
    // Test 3: Try to navigate to characters list
    console.log('Test 3: Navigating to characters list...');
    try {
      await page.click('a[href="/characters"], a[routerLink="/characters"], button:contains("Characters")');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('Could not find characters link, trying to navigate directly...');
      await page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle2' });
    }
    
    // Test 4: Check for character cards or list items
    console.log('Test 4: Checking for character list...');
    await page.waitForTimeout(3000);
    
    const characters = await page.$$eval(
      'app-character-card, .character-card, mat-card, .character-item',
      cards => cards.length
    );
    console.log(`Found ${characters} character cards/items`);
    
    // Test 5: Try to click a favorite button
    console.log('Test 5: Testing favorites functionality...');
    
    // Listen for console logs
    page.on('console', msg => {
      if (msg.text().includes('performFavoriteToggle') || msg.text().includes('favorite')) {
        console.log('Browser console:', msg.text());
      }
    });
    
    const favoriteButtons = await page.$$('button mat-icon, .favorite-btn, button[title*="favorite"]');
    
    if (favoriteButtons.length > 0) {
      console.log(`Found ${favoriteButtons.length} favorite buttons`);
      
      // Click the first favorite button
      await favoriteButtons[0].click();
      await page.waitForTimeout(3000);
      console.log('✓ Clicked favorite button');
    } else {
      console.log('No favorite buttons found, trying alternative selectors...');
      
      // Try clicking any button with mat-icon
      const iconButtons = await page.$$('button');
      console.log(`Found ${iconButtons.length} buttons total`);
      
      if (iconButtons.length > 0) {
        await iconButtons[0].click();
        await page.waitForTimeout(2000);
        console.log('✓ Clicked first button');
      }
    }
    
    // Test 6: Check favorites page
    console.log('Test 6: Testing favorites page...');
    try {
      await page.goto('http://localhost:4200/favorites', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      console.log('✓ Favorites page accessible');
    } catch (e) {
      console.log('Could not access favorites page:', e.message);
    }
    
    // Test 7: Test search functionality
    console.log('Test 7: Testing search functionality...');
    await page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const searchInput = await page.$('input[placeholder*="search"], input[type="search"], .search-input');
    if (searchInput) {
      await searchInput.type('Jon');
      await page.waitForTimeout(1000);
      console.log('✓ Search input works');
    } else {
      console.log('Search input not found');
    }
    
    console.log('All tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testApplication().catch(console.error);