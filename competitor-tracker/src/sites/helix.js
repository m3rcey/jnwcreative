import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.helixsleep.com';

/**
 * Scrape Helix mattress data
 */
export async function scrapeHelix() {
  console.log('🔍 Scraping Helix...');
  
  const data = {
    name: 'Helix',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    const $ = await scrapeUrl(`${BASE_URL}/mattresses`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Helix page, using sample data');
      return getSampleData(data);
    }

    // Helix uses Shopify - products usually in predictable structure
    $('.product-card, [data-product]').each((i, el) => {
      const name = $(el).find('.product-title, h3').first().text().trim();
      const priceText = $(el).find('.price, .money').first().text().trim();
      const price = parsePrice(priceText);
      
      if (name && price) {
        const category = categorizeProduct(name);
        data.products.push(createProduct(
          name,
          category,
          price,
          `${BASE_URL}/mattresses`,
          { brand: 'Helix' }
        ));
      }
    });

    data.policies = createPolicies(
      100, // 100-night trial
      10,  // 10-year warranty
      'Full refund within trial, free pickup'
    );

    const promoText = $('.announcement-bar, .promotion-banner').first().text().trim();
    if (promoText) {
      data.promotions.push({
        text: promoText,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Helix:', error.message);
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
  if (lower.includes('luxe')) return 'hybrid';
  if (lower.includes('plus')) return 'hybrid';
  return 'hybrid';
}

function getSampleData(data) {
  data.products = [
    createProduct('Helix Midnight', 'hybrid', 1099, `${BASE_URL}/midnight`, { size: 'Queen' }),
    createProduct('Helix Dusk', 'hybrid', 1099, `${BASE_URL}/dusk`, { size: 'Queen' }),
    createProduct('Helix Midnight Luxe', 'hybrid', 1999, `${BASE_URL}/midnight-luxe`, { size: 'Queen' }),
    createProduct('Helix Plus', 'hybrid', 1499, `${BASE_URL}/plus`, { size: 'Queen' })
  ];
  data.policies = createPolicies(100, 10, '100-night trial with full refund');
  return data;
}
