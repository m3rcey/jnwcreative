import { loadHistory, saveHistory } from './scraperBase.js';

/**
 * Compare current data with historical data
 * Returns changes and new promotions
 */
export async function compareData(currentData) {
  console.log('\n📊 Comparing with previous data...');
  
  const history = await loadHistory();
  const changes = {
    priceChanges: [],
    newPromotions: [],
    policyChanges: [],
    timestamp: new Date().toISOString()
  };

  for (const [competitorKey, current] of Object.entries(currentData)) {
    if (current.error) continue;
    
    const previous = history.competitors?.[competitorKey];
    
    if (!previous) {
      console.log(`   📁 New competitor data: ${current.name}`);
      continue;
    }

    // Compare prices
    const priceChanges = comparePrices(previous.products || [], current.products || [], current.name);
    changes.priceChanges.push(...priceChanges);

    // Compare promotions
    const newPromos = comparePromotions(previous.promotions || [], current.promotions || [], current.name);
    changes.newPromotions.push(...newPromos);

    // Compare policies
    const policyChanges = comparePolicies(previous.policies || {}, current.policies || {}, current.name);
    changes.policyChanges.push(...policyChanges);
  }

  console.log(`   Found ${changes.priceChanges.length} price changes`);
  console.log(`   Found ${changes.newPromotions.length} new promotions`);
  console.log(`   Found ${changes.policyChanges.length} policy changes`);

  // Save current data as new history
  await saveHistory(currentData);

  return changes;
}

function comparePrices(previous, current, competitorName) {
  const changes = [];
  const previousMap = new Map(previous.map(p => [p.name, p]));

  for (const product of current) {
    const prev = previousMap.get(product.name);
    
    if (prev && prev.price && product.price && prev.price !== product.price) {
      const diff = product.price - prev.price;
      const percentChange = ((diff / prev.price) * 100).toFixed(1);
      
      changes.push({
        competitor: competitorName,
        product: product.name,
        category: product.category,
        oldPrice: prev.price,
        newPrice: product.price,
        difference: diff,
        percentChange: parseFloat(percentChange),
        direction: diff > 0 ? 'increase' : 'decrease'
      });
    }
  }

  return changes;
}

function comparePromotions(previous, current, competitorName) {
  const changes = [];
  const previousTexts = new Set(previous.map(p => p.text?.toLowerCase().trim()));

  for (const promo of current) {
    const promoText = promo.text?.toLowerCase().trim();
    
    if (promoText && !previousTexts.has(promoText)) {
      changes.push({
        competitor: competitorName,
        text: promo.text,
        type: promo.type,
        scrapedAt: promo.scrapedAt
      });
    }
  }

  return changes;
}

function comparePolicies(previous, current, competitorName) {
  const changes = [];

  if (previous.trialPeriodDays !== current.trialPeriodDays) {
    changes.push({
      competitor: competitorName,
      type: 'trial',
      old: previous.trialPeriodDays,
      new: current.trialPeriodDays
    });
  }

  if (previous.warrantyYears !== current.warrantyYears) {
    changes.push({
      competitor: competitorName,
      type: 'warranty',
      old: previous.warrantyYears,
      new: current.warrantyYears
    });
  }

  return changes;
}

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  // Test with empty data
  compareData({}).then(changes => {
    console.log('\nComparison result:', JSON.stringify(changes, null, 2));
  });
}
