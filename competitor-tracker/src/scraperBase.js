import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data');
const HISTORY_FILE = join(DATA_DIR, 'history.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory may already exist
  }
}

/**
 * Load previous price history
 */
export async function loadHistory() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // No history yet, return empty structure
    return {
      lastUpdated: null,
      competitors: {}
    };
  }
}

/**
 * Save current data as new history
 */
export async function saveHistory(data) {
  await ensureDataDir();
  const history = {
    lastUpdated: new Date().toISOString(),
    competitors: data
  };
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log('💾 Price history saved');
}

/**
 * Generic scraper with axios + cheerio
 */
export async function scrapeUrl(url, config = {}) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...config.headers
      },
      timeout: 30000,
      ...config
    });
    
    return cheerio.load(response.data);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

/**
 * Standard product structure
 */
export function createProduct(name, category, price, url, details = {}) {
  return {
    name,
    category, // 'hybrid', 'memory-foam', 'adjustable-base'
    price: parseFloat(price) || null,
    currency: 'USD',
    url,
    scrapedAt: new Date().toISOString(),
    ...details
  };
}

/**
 * Standard policy structure
 */
export function createPolicies(trialDays, warrantyYears, returnPolicy, details = {}) {
  return {
    trialPeriodDays: trialDays,
    warrantyYears: warrantyYears,
    returnPolicy: returnPolicy,
    scrapedAt: new Date().toISOString(),
    ...details
  };
}
