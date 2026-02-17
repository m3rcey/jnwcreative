import { scrapeAll } from './scraper.js';
import { compareData } from './compare.js';
import { sendSlackNotification } from './slack.js';
import { config, validateConfig } from './config.js';

console.log('🛏️  Competitor Price & Policy Tracker');
console.log('=====================================\n');

validateConfig();

async function runTracker() {
  const startTime = Date.now();
  
  try {
    // Step 1: Scrape all competitors
    const currentData = await scrapeAll();
    
    // Step 2: Compare with previous data
    const changes = await compareData(currentData);
    
    // Step 3: Send Slack notification
    await sendSlackNotification(changes);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Tracker completed in ${duration}s`);
    
  } catch (error) {
    console.error('\n❌ Tracker failed:', error.message);
    process.exit(1);
  }
}

runTracker();
