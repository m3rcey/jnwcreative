import { config, validateConfig } from './config.js';
import { notionClient } from './notion.js';
import { searchSocialProfiles, formatEnrichmentResults } from './braveSearch.js';

console.log('🚀 CRM Auto-Enrichment System Starting...');
console.log(`⏱️  Polling interval: ${config.pollIntervalMs / 1000} seconds`);

// Validate configuration
validateConfig();

/**
 * Main enrichment workflow
 */
async function processNewProspects() {
  console.log('\n📋 Checking for new prospects...');
  
  try {
    // Get prospects that haven't been enriched yet
    const prospects = await notionClient.getNewProspects();
    
    if (prospects.length === 0) {
      console.log('   No new prospects to enrich.');
      return;
    }
    
    console.log(`   Found ${prospects.length} prospect(s) to enrich`);
    
    for (const prospect of prospects) {
      console.log(`\n🎯 Processing: ${prospect.name}`);
      
      if (!prospect.name) {
        console.log('   ⚠️  Skipping: No name found');
        continue;
      }
      
      // Search for social profiles
      const searchResults = await searchSocialProfiles(prospect.name);
      
      // Format results
      const enrichmentText = formatEnrichmentResults(searchResults, prospect.name);
      
      // Update Notion
      const success = await notionClient.appendEnrichment(prospect.id, enrichmentText);
      
      if (success) {
        console.log(`   ✅ Enrichment complete for ${prospect.name}`);
      } else {
        console.log(`   ❌ Failed to enrich ${prospect.name}`);
      }
      
      // Small delay between prospects to be nice to APIs
      await sleep(1000);
    }
    
  } catch (error) {
    console.error('Error in enrichment process:', error.message);
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main polling loop
 */
async function startPolling() {
  // Run immediately on start
  await processNewProspects();
  
  // Then poll on interval
  setInterval(processNewProspects, config.pollIntervalMs);
  
  console.log('\n🔄 Polling started. Press Ctrl+C to stop.');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down CRM Enrichment System...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down CRM Enrichment System...');
  process.exit(0);
});

// Start the system
startPolling();
