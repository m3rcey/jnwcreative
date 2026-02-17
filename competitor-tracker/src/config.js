import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

export const config = {
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: process.env.SLACK_CHANNEL || '#competitor-alerts'
  }
};

export function validateConfig() {
  if (!config.slack.webhookUrl) {
    console.log('⚠️  SLACK_WEBHOOK_URL not set - notifications will be logged only');
  }
}
