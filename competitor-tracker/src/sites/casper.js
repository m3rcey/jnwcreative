import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.casper.com';

/**
 * Scrape Casper mattress data
 */
export async function scrapeCasper() {
  console.log('🔍 Scraping Casper...');
  
  const data = {
    name: 'Casper',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    const $ = await scrapeUrl(`${BASE_URL}/mattresses`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Casper page, using sample data');
      return getSampleData(data);
    }

    // Extract products
    $('[data-testid*="product"], .product-card').each((i, el) => {
      const name = $(el).find('h2, h3, .product-name').first().text().trim();
      const priceText = $(el).find('[data-price], .price').first().text().trim() || 
                        $(el).find('.price-current').first().text().trim();
      const price = parsePrice(priceText);
      
      if (name && price) {
        const category = categorizeProduct(name);
        data.products.push(createProduct(
          name,
          category,
          price,
          `${BASE_URL}/mattresses`,
          { brand: 'Casper' }
        ));
      }
    });

    data.policies = createPolicies(
      100, // 100-night trial
      10,  // 10-year warranty
      'Free returns, full refund within trial period'
    );

    // Check for promotions
    const promoText = $('.promotion, .sale-message, [data-testid*="promo"]').first().text().trim();
    if (promoText && promoText.length > 5) {
      data.promotions.push({
        text: promoText,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Casper:', error.message);
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
  if (lower.includes('wave') || lower.includes('foam')) return 'memory-foam';
  if (lower.includes('original')) return 'memory-foam';
  if (lower.includes('adjustable')) return 'adjustable-base';
  return 'memory-foam';
}

function getSampleData(data) {
  data.products = [
    createProduct('Casper Original', 'memory-foam', 1295, `${BASE_URL}/mattresses/casper-original`, { size: 'Queen' }),
    createProduct('Casper Hybrid', 'hybrid', 1695, `${BASE_URL}/mattresses/casper-hybrid`, { size: 'Queen' }),
    createProduct('Wave Hybrid', 'hybrid', 2995, `${BASE_URL}/mattresses/wave-hybrid`, { size: 'Queen' }),
    createProduct('Nova Hybrid', 'hybrid', 2495, `${BASE_URL}/mattresses/nova-hybrid`, { size: 'Queen' })
  ];
  data.policies = createPolicies(100, 10, 'Full refund within 100 nights');
  return data;
}
