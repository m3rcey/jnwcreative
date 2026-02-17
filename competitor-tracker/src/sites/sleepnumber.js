import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.sleepnumber.com';

/**
 * Scrape Sleep Number mattress data
 */
export async function scrapeSleepNumber() {
  console.log('🔍 Scraping Sleep Number...');
  
  const data = {
    name: 'Sleep Number',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    const $ = await scrapeUrl(`${BASE_URL}/mattresses`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Sleep Number page, using sample data');
      return getSampleData(data);
    }

    // Extract smart bed models
    $('.product-item, .mattress-card').each((i, el) => {
      const name = $(el).find('.product-name, h3').first().text().trim();
      const priceText = $(el).find('.price, .product-price').first().text().trim();
      const price = parsePrice(priceText);
      
      if (name && price) {
        data.products.push(createProduct(
          name,
          'adjustable-base',
          price,
          `${BASE_URL}/mattresses`,
          { brand: 'Sleep Number', type: 'smart-bed' }
        ));
      }
    });

    data.policies = createPolicies(
      100, // 100-night trial
      15,  // 15-year warranty
      'In-home trial with full refund, exchange options available'
    );

    const promoBanner = $('.promo-banner, .offer-banner').first().text().trim();
    if (promoBanner) {
      data.promotions.push({
        text: promoBanner,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Sleep Number:', error.message);
    return getSampleData(data);
  }

  return data;
}

function parsePrice(priceText) {
  const match = priceText.match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : null;
}

function getSampleData(data) {
  data.products = [
    createProduct('c2 Smart Bed', 'adjustable-base', 699, `${BASE_URL}/c2`, { size: 'Queen' }),
    createProduct('c4 Smart Bed', 'adjustable-base', 1699, `${BASE_URL}/c4`, { size: 'Queen' }),
    createProduct('i8 Smart Bed', 'adjustable-base', 3399, `${BASE_URL}/i8`, { size: 'Queen' }),
    createProduct('i10 Smart Bed', 'adjustable-base', 5099, `${BASE_URL}/i10`, { size: 'Queen' }),
    createProduct('Climate360', 'adjustable-base', 9899, `${BASE_URL}/climate360`, { size: 'Queen' })
  ];
  data.policies = createPolicies(100, 15, '100-night trial with full refund');
  return data;
}
