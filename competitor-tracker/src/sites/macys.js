import { scrapeUrl, createProduct, createPolicies } from '../scraperBase.js';

const BASE_URL = 'https://www.macys.com';

/**
 * Scrape Macy's mattress data
 */
export async function scrapeMacys() {
  console.log('🔍 Scraping Macy\'s...');
  
  const data = {
    name: 'Macy\'s',
    baseUrl: BASE_URL,
    products: [],
    policies: {},
    promotions: [],
    scrapedAt: new Date().toISOString()
  };

  try {
    const $ = await scrapeUrl(`${BASE_URL}/shop/mattresses/Mattress_size/Queen?id=249548`);
    
    if (!$) {
      console.log('   ⚠️  Could not load Macy\'s page, using sample data');
      return getSampleData(data);
    }

    // Macy's product grid
    $('.product-cell').each((i, el) => {
      const name = $(el).find('.product-description').first().text().trim();
      const priceText = $(el).find('.sale-price, .regular-price').first().text().trim();
      const price = parsePrice(priceText);
      
      if (name && price) {
        const category = categorizeProduct(name);
        data.products.push(createProduct(
          name,
          category,
          price,
          `${BASE_URL}/shop/mattresses`,
          { retailer: 'Macy\'s' }
        ));
      }
    });

    data.policies = createPolicies(
      120, // 120-day comfort trial
      10,  // Varies by manufacturer
      'Comfort trial with exchange options, delivery fees may apply'
    );

    const promoText = $('.promotional-message').first().text().trim();
    if (promoText) {
      data.promotions.push({
        text: promoText,
        type: 'sale',
        scrapedAt: new Date().toISOString()
      });
    }

    console.log(`   ✅ Found ${data.products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Error scraping Macy\'s:', error.message);
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
  if (lower.includes('pillow top')) return 'innerspring';
  return 'hybrid';
}

function getSampleData(data) {
  data.products = [
    createProduct('Sealy Posturepedic Plus', 'hybrid', 1299, `${BASE_URL}/shop/mattresses`, { brand: 'Sealy', size: 'Queen' }),
    createProduct('Beautyrest Platinum', 'hybrid', 1899, `${BASE_URL}/shop/mattresses`, { brand: 'Beautyrest', size: 'Queen' }),
    createProduct('Serta Perfect Sleeper', 'innerspring', 799, `${BASE_URL}/shop/mattresses`, { brand: 'Serta', size: 'Queen' }),
    createProduct('Tempur-Pedic Cloud', 'memory-foam', 2199, `${BASE_URL}/shop/mattresses`, { brand: 'Tempur-Pedic', size: 'Queen' })
  ];
  data.policies = createPolicies(120, 10, '120-day comfort trial');
  return data;
}
