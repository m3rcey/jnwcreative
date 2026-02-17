import { scrapeSaatva } from './sites/saatva.js';
import { scrapeCasper } from './sites/casper.js';
import { scrapeSleepNumber } from './sites/sleepnumber.js';
import { scrapeHelix } from './sites/helix.js';
import { scrapeAshley } from './sites/ashley.js';
import { scrapeMacys } from './sites/macys.js';
import { scrapeCostco } from './sites/costco.js';

/**
 * Scrape all competitor sites
 */
export async function scrapeAll() {
  console.log('\n🌐 Starting competitor scrape...\n');
  
  const results = {};
  const scrapers = [
    { name: 'saatva', fn: scrapeSaatva },
    { name: 'casper', fn: scrapeCasper },
    { name: 'sleepnumber', fn: scrapeSleepNumber },
    { name: 'helix', fn: scrapeHelix },
    { name: 'ashley', fn: scrapeAshley },
    { name: 'macys', fn: scrapeMacys },
    { name: 'costco', fn: scrapeCostco }
  ];

  for (const scraper of scrapers) {
    try {
      const data = await scraper.fn();
      results[scraper.name] = data;
    } catch (error) {
      console.error(`Failed to scrape ${scraper.name}:`, error.message);
      results[scraper.name] = {
        name: scraper.name,
        error: error.message,
        scrapedAt: new Date().toISOString()
      };
    }
    
    // Small delay between requests to be respectful
    await sleep(1000);
  }

  console.log('\n✅ Scrape complete');
  return results;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeAll().then(data => {
    console.log('\n📊 Scraped Data Summary:');
    for (const [key, value] of Object.entries(data)) {
      if (value.error) {
        console.log(`  ${key}: ❌ Error - ${value.error}`);
      } else {
        console.log(`  ${key}: ✅ ${value.products?.length || 0} products`);
      }
    }
  });
}
