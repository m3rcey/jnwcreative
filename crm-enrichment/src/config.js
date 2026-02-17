import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

export const config = {
  notion: {
    token: process.env.NOTION_TOKEN,
    databaseId: process.env.NOTION_DATABASE_ID
  },
  brave: {
    apiKey: process.env.BRAVE_API_KEY
  },
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS) || 300000 // 5 minutes
};

// Validate config
export function validateConfig() {
  const errors = [];
  
  if (!config.notion.token) errors.push('NOTION_TOKEN is required');
  if (!config.notion.databaseId) errors.push('NOTION_DATABASE_ID is required');
  if (!config.brave.apiKey) errors.push('BRAVE_API_KEY is required');
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
}
