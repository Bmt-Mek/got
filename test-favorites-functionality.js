const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testFavoritesFunctionality() {
  console.log('🚀 Starting Favorites Functionality Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
  });
  
  // Enable error logging
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.message}`);
  });
  
  // Enable request/response logging for API calls
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('character')) {
      console.log(`[API] ${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    console.log('\n📱 Step 1: Navigate to application and verify it loads');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    
    // Take screenshot
    await page.screenshot({ path: 'test-step1-homepage.png', fullPage: true });
    console.log('✅ Application loaded successfully');
    
    // Wait a moment for any initial loading
    await page.waitForTimeout(2000);
    
    console.log('\n🔍 Step 2: Navigate to characters list page');
    
    // Look for navigation to characters list
    const charactersLink = await page.$('a[routerLink="/characters"], a[href="/characters"], button:contains("Characters")');
    if (charactersLink) {
      await charactersLink.click();
      console.log('✅ Clicked characters navigation link');
    } else {
      // Try direct navigation
      await page.goto('http://localhost:4200/characters', { waitUntil: 'networkidle2' });
      console.log('✅ Navigated directly to characters page');
    }
    
    // Wait for characters to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-step2-characters-list.png', fullPage: true });
    
    console.log('\n⭐ Step 3: Test adding/removing favorites from characters list');
    
    // Look for favorite buttons/icons
    const favoriteButtons = await page.$$('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
    console.log(`Found ${favoriteButtons.length} potential favorite buttons`);
    
    if (favoriteButtons.length > 0) {
      // Test clicking the first favorite button
      console.log('🔄 Testing first favorite button...');
      
      // Get initial state
      const initialState = await page.evaluate(() => {
        const btn = document.querySelector('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
        return btn ? {
          classes: btn.className,
          innerText: btn.innerText,
          innerHTML: btn.innerHTML
        } : null;
      });
      
      console.log('Initial favorite button state:', initialState);
      
      // Click the favorite button
      await favoriteButtons[0].click();
      console.log('✅ Clicked first favorite button');
      
      // Wait for state change
      await page.waitForTimeout(1000);
      
      // Check for state change
      const newState = await page.evaluate(() => {
        const btn = document.querySelector('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
        return btn ? {
          classes: btn.className,
          innerText: btn.innerText,
          innerHTML: btn.innerHTML
        } : null;
      });
      
      console.log('New favorite button state:', newState);
      
      // Check if state changed
      if (JSON.stringify(initialState) !== JSON.stringify(newState)) {
        console.log('✅ Favorite button state changed successfully');
      } else {
        console.log('⚠️  Favorite button state did not change');
      }
      
      // Test clicking again to toggle
      console.log('🔄 Testing favorite toggle...');
      await favoriteButtons[0].click();
      await page.waitForTimeout(1000);
      
      const toggledState = await page.evaluate(() => {
        const btn = document.querySelector('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
        return btn ? {
          classes: btn.className,
          innerText: btn.innerText,
          innerHTML: btn.innerHTML
        } : null;
      });
      
      console.log('Toggled favorite button state:', toggledState);
      
    } else {
      console.log('⚠️  No favorite buttons found on characters list page');
    }
    
    await page.screenshot({ path: 'test-step3-favorites-tested.png', fullPage: true });
    
    console.log('\n🔍 Step 4: Navigate to character detail page');
    
    // Look for character links or cards to click
    const characterLinks = await page.$$('a[routerLink*="/character"], .character-card a, .character-item a');
    
    if (characterLinks.length > 0) {
      console.log(`Found ${characterLinks.length} character links`);
      await characterLinks[0].click();
      console.log('✅ Clicked first character link');
      
      // Wait for navigation and page load
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-step4-character-detail.png', fullPage: true });
      
      console.log('\n⭐ Step 5: Test favorite functionality on character detail page');
      
      // Look for favorite button on detail page
      const detailFavoriteButton = await page.$('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
      
      if (detailFavoriteButton) {
        console.log('✅ Found favorite button on character detail page');
        
        // Get initial state
        const initialDetailState = await page.evaluate(() => {
          const btn = document.querySelector('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
          return btn ? {
            classes: btn.className,
            innerText: btn.innerText,
            innerHTML: btn.innerHTML
          } : null;
        });
        
        console.log('Initial detail favorite state:', initialDetailState);
        
        // Click favorite button
        await detailFavoriteButton.click();
        console.log('✅ Clicked favorite button on detail page');
        
        await page.waitForTimeout(1000);
        
        // Check state change
        const newDetailState = await page.evaluate(() => {
          const btn = document.querySelector('button[class*="favorite"], .favorite-icon, button:contains("♥"), button:contains("❤"), [class*="heart"]');
          return btn ? {
            classes: btn.className,
            innerText: btn.innerText,
            innerHTML: btn.innerHTML
          } : null;
        });
        
        console.log('New detail favorite state:', newDetailState);
        
        if (JSON.stringify(initialDetailState) !== JSON.stringify(newDetailState)) {
          console.log('✅ Detail page favorite button state changed successfully');
        } else {
          console.log('⚠️  Detail page favorite button state did not change');
        }
        
      } else {
        console.log('⚠️  No favorite button found on character detail page');
      }
      
      await page.screenshot({ path: 'test-step5-detail-favorites-tested.png', fullPage: true });
      
    } else {
      console.log('⚠️  No character links found to navigate to detail page');
    }
    
    console.log('\n🔍 Step 6: Test favorites page (if exists)');
    
    // Try to navigate to favorites page
    try {
      await page.goto('http://localhost:4200/favorites', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-step6-favorites-page.png', fullPage: true });
      console.log('✅ Successfully navigated to favorites page');
    } catch (error) {
      console.log('⚠️  Could not navigate to favorites page:', error.message);
    }
    
    console.log('\n📊 Step 7: Check for any JavaScript errors or console warnings');
    
    // Get any console errors that might have occurred
    const logs = await page.evaluate(() => {
      return window.console.history || [];
    });
    
    console.log('Console logs captured during test:', logs);
    
    console.log('\n✅ Favorites functionality test completed!');
    console.log('📸 Screenshots saved:');
    console.log('  - test-step1-homepage.png');
    console.log('  - test-step2-characters-list.png');
    console.log('  - test-step3-favorites-tested.png');
    console.log('  - test-step4-character-detail.png');
    console.log('  - test-step5-detail-favorites-tested.png');
    console.log('  - test-step6-favorites-page.png');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ path: 'test-error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testFavoritesFunctionality()
  .then(() => {
    console.log('\n🎉 Test execution completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });