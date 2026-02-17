# CRM Auto-Enrichment System

Automatically enriches new prospects in Notion with social profile information from LinkedIn, Twitter/X, and Instagram.

## How It Works

1. Polls Notion "Mattress Prospects" database every 5 minutes for new entries
2. Extracts the prospect's name
3. Searches the web for social profiles using Brave Search API
4. Appends findings to the "Conversation Notes" field in Notion

## Setup Instructions

### 1. Install Dependencies

```bash
cd /home/merce/.openclaw/workspace/crm-enrichment
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
# Notion API credentials
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_mattress_prospects_database_id

# Brave Search API (get from https://api.search.brave.com/)
BRAVE_API_KEY=your_brave_api_key

# Polling interval (milliseconds, default: 5 minutes)
POLL_INTERVAL_MS=300000
```

### 3. Set Up Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Copy the "Internal Integration Token" to `NOTION_TOKEN`
4. Share your "Mattress Prospects" database with the integration
5. Copy the database ID from the URL and set `NOTION_DATABASE_ID`

### 4. Run the System

```bash
# Run once
npm start

# Run with auto-reload (development)
npm run dev
```

### 5. Set Up as Persistent Service (Optional)

Using PM2:
```bash
npm install -g pm2
pm2 start src/index.js --name crm-enrichment
pm2 save
pm2 startup
```

Using systemd:
```bash
# Copy the service file
sudo cp crm-enrichment.service /etc/systemd/system/
sudo systemctl enable crm-enrichment
sudo systemctl start crm-enrichment
```

## Database Schema Requirements

Your Notion "Mattress Prospects" database should have:
- **Name** (title field) - Prospect's full name
- **Conversation Notes** (rich text) - Where enrichment data is appended

## Example Output

When a new prospect "John Smith" is added:

```
--- Auto-Enrichment Results ---
Searched: 2026-02-14T11:00:00Z

LinkedIn: https://linkedin.com/in/johnsmith
- Title: Senior VP of Operations at SleepWell Inc.
- Location: Austin, TX

Twitter/X: https://twitter.com/johnsmith
- Bio: Mattress industry veteran | Sleep tech enthusiast
- Recent: Launching new product line Q2 2026

Instagram: https://instagram.com/johnsmith
- Business account with 2.3k followers
- Posts about sleep wellness and mattress reviews
```

## File Structure

```
crm-enrichment/
├── src/
│   ├── index.js          # Main polling loop
│   ├── notion.js         # Notion API wrapper
│   ├── braveSearch.js    # Brave Search API wrapper
│   └── test.js           # Test utilities
├── .env                  # Environment variables (not in git)
├── .env.example          # Example env file
├── package.json
└── README.md
```

## Troubleshooting

**Notion API errors:** Ensure the integration has access to the database

**No results found:** Check that Brave API key is valid and has quota remaining

**Rate limiting:** The system includes automatic backoff; increase POLL_INTERVAL_MS if needed
