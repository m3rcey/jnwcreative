import { scrapeAll } from './scraper.js';
import { compareData } from './compare.js';
import { sendSlackNotification, generateDetailedTable } from './slack.js';

console.log('🧪 Competitor Tracker Test Suite\n');

async function runTests() {
  // Test 1: Scrape all sites
  console.log('Test 1: Scraping all competitor sites...');
  const data = await scrapeAll();
  console.log('\n✅ Scraped data summary:');
  for (const [key, value] of Object.entries(data)) {
    if (value.error) {
      console.log(`  ${key}: ❌ ${value.error}`);
    } else {
      console.log(`  ${key}: ${value.products?.length || 0} products, ${value.promotions?.length || 0} promos`);
    }
  }

  // Test 2: Compare data
  console.log('\nTest 2: Comparing with history...');
  const changes = await compareData(data);
  console.log('Changes detected:');
  console.log(`  Price changes: ${changes.priceChanges.length}`);
  console.log(`  New promotions: ${changes.newPromotions.length}`);
  console.log(`  Policy changes: ${changes.policyChanges.length}`);

  // Test 3: Generate Slack message
  console.log('\nTest 3: Generating Slack message...');
  const testChanges = {
    priceChanges: [
      { 
        competitor: 'Saatva', 
        product: 'Saatva Classic', 
        category: 'hybrid',
        oldPrice: 1595, 
        newPrice: 1495, 
        difference: -100, 
        percentChange: -6.3,
        direction: 'decrease' 
      },
      { 
        competitor: 'Helix', 
        product: 'Helix Midnight Luxe', 
        category: 'hybrid',
        oldPrice: 1999, 
        newPrice: 1799, 
        difference: -200, 
        percentChange: -10.0,
        direction: 'decrease' 
      }
    ],
    newPromotions: [
      { competitor: 'Helix', text: 'Presidents Day Sale - $200 off + 2 free pillows', type: 'sale' },
      { competitor: 'Sleep Number', text: 'Save $800 on i8 Smart Bed', type: 'sale' }
    ],
    policyChanges: [],
    timestamp: new Date().toISOString()
  };
  
  console.log('Test changes:', JSON.stringify(testChanges, null, 2));

  // Test 4: Generate detailed table
  console.log('\nTest 4: Generating detailed comparison table...');
  const table = generateDetailedTable(data);
  console.log(table.substring(0, 1000) + '...');

  console.log('\n✅ All tests complete');
}

runTests().catch(console.error);
