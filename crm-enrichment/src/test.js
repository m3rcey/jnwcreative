import { config, validateConfig } from './config.js';
import { notionClient } from './notion.js';
import { searchSocialProfiles, formatEnrichmentResults } from './braveSearch.js';

console.log('🧪 CRM Enrichment Test Mode\n');

validateConfig();

async function runTests() {
  // Test 1: Fetch prospects
  console.log('Test 1: Fetching prospects from Notion...');
  const prospects = await notionClient.getNewProspects();
  console.log(`   Found ${prospects.length} prospect(s)`);
  
  if (prospects.length > 0) {
    console.log('   Sample prospect:', JSON.stringify(prospects[0], null, 2));
  }
  
  // Test 2: Search social profiles (requires Brave API to be configured)
  console.log('\nTest 2: Searching social profiles...');
  const testName = 'Elon Musk';
  const results = await searchSocialProfiles(testName);
  console.log('   Search results:', JSON.stringify(results, null, 2));
  
  // Test 3: Format enrichment
  console.log('\nTest 3: Formatting enrichment results...');
  const formatted = formatEnrichmentResults(results, testName);
  console.log('   Formatted output:');
  console.log(formatted);
  
  console.log('\n✅ Tests complete');
}

runTests().catch(console.error);
