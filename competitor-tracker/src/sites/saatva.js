import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.saatva.com';

/**
 * Scrape Saatva mattress data
 */
export async function scrapeSaatva() {
  console.log('🔍 Scraping Saatva...');
  
  const data = {
    name: 'Saatva',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    // Scrape main mattress page
    const $ = await scrapeUrl(`${BASE_URL}/mattresses`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Saatva page, using sample data');
      return getSampleData(data);
    }

    // Extract products ( selectors are approximate - would need actual site inspection)
    $('.product-card, .mattress-card').each((i, el) => {
      const name = $(el).find('.product-name, h3').first().text().trim();
      const priceText = $(el).find('.price, .product-price').first().text().trim();
      const price = parsePrice(priceText);
      
      if (name && price) {
        const category = categorizeProduct(name);
        data.products.push(createProduct(
          name,
          category,
          price,
          `${BASE_URL}/mattresses`,
          { brand: 'Saatva' }
        ));
      }
    });

    // Extract policies
    data.policies = createPolicies(
      365, // Saatva offers 1-year trial
      25,  // 25-year warranty
      'Full refund within trial period, white glove pickup'
    );

    // Extract promotions
    const promoBanner = $('.promotion-banner, .sale-banner').first().text().trim();
    if (promoBanner) {
      data.promotions.push({
        text: promoBanner,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Saatva:', error.message);
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
  if (lower.includes('memory') || lower.includes('foam')) return 'memory-foam';
  if (lower.includes('adjustable') || lower.includes('base')) return 'adjustable-base';
  return 'hybrid'; // default
}

function getSampleData(data) {
  // Fallback sample data for demonstration
  data.products = [
    createProduct('Saatva Classic', 'hybrid', 1595, `${BASE_URL}/mattresses/saatva-classic`, { size: 'Queen' }),
    createProduct('Saatva Loom & Leaf', 'memory-foam', 1495, `${BASE_URL}/mattresses/loom-and-leaf`, { size: 'Queen' }),
    createProduct('Saatva HD', 'hybrid', 1995, `${BASE_URL}/mattresses/saatva-hd`, { size: 'Queen' }),
    createProduct('Solaire Adjustable', 'adjustable-base', 2995, `${BASE_URL}/mattresses/solaire`, { size: 'Queen' })
  ];
  data.policies = createPolicies(365, 25, 'Full refund within 1-year trial');
  return data;
}
