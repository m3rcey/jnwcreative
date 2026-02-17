import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.costco.com';

/**
 * Scrape Costco mattress data
 */
export async function scrapeCostco() {
  console.log('🔍 Scraping Costco...');
  
  const data = {
    name: 'Costco',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    const $ = await scrapeUrl(`${BASE_URL}/mattresses.html`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Costco page, using sample data');
      return getSampleData(data);
    }

    // Costco product structure
    $('.product-tile').each((i, el) => {
      const name = $(el).find('.description').first().text().trim();
      const priceText = $(el).find('.price').first().text().trim();
      const price = parsePrice(priceText);
      
      if (name && price) {
        const category = categorizeProduct(name);
        data.products.push(createProduct(
          name,
          category,
          price,
          `${BASE_URL}/mattresses.html`,
          { retailer: 'Costco', membership: 'required' }
        ));
      }
    });

    data.policies = createPolicies(
      0,   // Costco doesn't have trial period but has great return policy
      10,  // Manufacturer warranty
      'Costco return policy applies - satisfaction guaranteed'
    );

    const promoText = $('.marketing-content').first().text().trim();
    if (promoText) {
      data.promotions.push({
        text: promoText,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Costco:', error.message);
    return getSampleData(data);
  }

  return data;
}

function parsePrice(priceText) {
  const match = priceText.match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : null;
}

function categorizeProduct(name) {
  const lower = name.toLowerCase();
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('memory')) return 'memory-foam';
  if (lower.includes('adjustable')) return 'adjustable-base';
  return 'hybrid';
}

function getSampleData(data) {
  data.products = [
    createProduct('Sealy Posturepedic Hybrid', 'hybrid', 799, `${BASE_URL}/mattresses.html`, { brand: 'Sealy', size: 'Queen' }),
    createProduct('Tempur-Pedic TEMPUR-Cloud', 'memory-foam', 1699, `${BASE_URL}/mattresses.html`, { brand: 'Tempur-Pedic', size: 'Queen' }),
    createProduct('Sleep Science Memory Foam', 'memory-foam', 599, `${BASE_URL}/mattresses.html`, { brand: 'Sleep Science', size: 'Queen' }),
    createProduct('Novaform ComfortGrande', 'memory-foam', 499, `${BASE_URL}/mattresses.html`, { brand: 'Novaform', size: 'Queen' })
  ];
  data.policies = createPolicies(0, 10, 'Costco satisfaction guarantee - return anytime');
  return data;
}
