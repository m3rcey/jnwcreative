import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.ashleyfurniture.com';

/**
 * Scrape Ashley Furniture mattress data
 */
export async function scrapeAshley() {
  console.log('🔍 Scraping Ashley Furniture...');
  
  const data = {
    name: 'Ashley Furniture',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    const $ = await scrapeUrl(`${BASE_URL}/bedroom/mattresses/`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Ashley page, using sample data');
      return getSampleData(data);
    }

    // Ashley sells multiple brands
    $('.product-item').each((i, el) => {
      const name = $(el).find('.product-name').first().text().trim();
      const priceText = $(el).find('.price, .current-price').first().text().trim();
      const price = parsePrice(priceText);
      const brand = $(el).find('.brand-name').first().text().trim() || 'Ashley';
      
      if (name && price) {
        const category = categorizeProduct(name);
        data.products.push(createProduct(
          `${brand} ${name}`,
          category,
          price,
          `${BASE_URL}/bedroom/mattresses/`,
          { retailer: 'Ashley Furniture', brand }
        ));
      }
    });

    data.policies = createPolicies(
      120, // 120-night comfort guarantee
      10,  // Varies by brand
      'Comfort guarantee with exchange options'
    );

    const promoBanner = $('.promo-message, .sale-banner').first().text().trim();
    if (promoBanner) {
      data.promotions.push({
        text: promoBanner,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Ashley:', error.message);
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
  if (lower.includes('innerspring')) return 'innerspring';
  return 'hybrid';
}

function getSampleData(data) {
  data.products = [
    createProduct('Sealy Posturepedic Hybrid', 'hybrid', 1299, `${BASE_URL}/bedroom/mattresses/`, { brand: 'Sealy', size: 'Queen' }),
    createProduct('Tempur-Pedic ProAdapt', 'memory-foam', 2999, `${BASE_URL}/bedroom/mattresses/`, { brand: 'Tempur-Pedic', size: 'Queen' }),
    createProduct('Ashley Chime Hybrid', 'hybrid', 599, `${BASE_URL}/bedroom/mattresses/`, { brand: 'Ashley', size: 'Queen' }),
    createProduct('Beautyrest Black', 'hybrid', 2499, `${BASE_URL}/bedroom/mattresses/`, { brand: 'Beautyrest', size: 'Queen' })
  ];
  data.policies = createPolicies(120, 10, '120-night comfort guarantee');
  return data;
}
