# Josh's Automation Systems

Two automation systems built for Josh to streamline mattress industry competitive intelligence and CRM enrichment.

## 📁 System 1: CRM Auto-Enrichment

**Location:** `/home/merce/.openclaw/workspace/crm-enrichment/`

Automatically enriches new prospect records in Notion with social profile data from LinkedIn, Twitter/X, and Instagram.

### Quick Start

```bash
cd /home/merce/.openclaw/workspace/crm-enrichment

# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Notion and Brave API credentials

# 3. Run
npm start
```

### Features
- Polls Notion every 5 minutes for new prospects
- Searches web for social profiles
- Appends findings to "Conversation Notes" field
- Graceful error handling and retry logic

---

## 📁 System 2: Competitor Price & Policy Tracker

**Location:** `/home/merce/.openclaw/workspace/competitor-tracker/`

Monitors mattress competitors daily and sends Slack alerts for price changes and new promotions.

### Competitors Monitored

**Direct Brands:** Saatva, Casper, Sleep Number, Helix  
**Retailers:** Ashley Furniture, Macy's, Costco  
*(Excludes: Mattress Firm - Josh's employer)*

### Quick Start

```bash
cd /home/merce/.openclaw/workspace/competitor-tracker

# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Slack webhook URL

# 3. Run manually
npm start

# 4. Schedule with cron (runs daily at 8 AM CT)
crontab crontab.txt
```

### Features
- Tracks prices for hybrid, memory foam, and adjustable base mattresses
- Monitors trial periods, warranties, and return policies
- Detects new sales and promotions
- Sends formatted Slack notifications
- Stores price history in JSON

---

## System Requirements

- Node.js 18+ 
- npm
- Linux/macOS (Windows with WSL)

## API Keys Required

### Notion (CRM Enrichment)
1. Go to https://www.notion.so/my-integrations
2. Create integration and copy token
3. Share your database with the integration

### Brave Search (CRM Enrichment)
1. Sign up at https://api.search.brave.com/
2. Get API key from dashboard

### Slack (Competitor Tracker)
1. Go to https://api.slack.com/apps
2. Create app → Incoming Webhooks
3. Add webhook to your workspace
4. Copy webhook URL

## Project Structure

```
/home/merce/.openclaw/workspace/
├── crm-enrichment/
│   ├── src/
│   │   ├── index.js          # Main polling loop
│   │   ├── notion.js         # Notion API wrapper
│   │   ├── braveSearch.js    # Web search wrapper
│   │   └── config.js         # Environment config
│   ├── .env.example
│   ├── package.json
│   ├── crm-enrichment.service # systemd unit file
│   ├── README.md
│   └── EXAMPLE_OUTPUT.md
│
└── competitor-tracker/
    ├── src/
    │   ├── index.js          # Main entry point
    │   ├── scraper.js        # Orchestrates all scrapers
    │   ├── compare.js        # Price comparison engine
    │   ├── slack.js          # Slack notifications
    │   ├── config.js         # Environment config
    │   ├── scraperBase.js    # Shared utilities
    │   └── sites/            # Site-specific scrapers
    │       ├── saatva.js
    │       ├── casper.js
    │       ├── sleepnumber.js
    │       ├── helix.js
    │       ├── ashley.js
    │       ├── macys.js
    │       └── costco.js
    ├── data/
    │   └── history.example.json
    ├── logs/
    ├── crontab.txt           # Cron schedule config
    ├── .env.example
    ├── package.json
    ├── README.md
    └── EXAMPLE_OUTPUT.md
```

## Running as Services

### CRM Enrichment (Persistent)

Using PM2:
```bash
npm install -g pm2
pm2 start crm-enrichment/src/index.js --name crm-enrichment
pm2 save
pm2 startup
```

Using systemd:
```bash
sudo cp crm-enrichment/crm-enrichment.service /etc/systemd/system/
sudo systemctl enable crm-enrichment
sudo systemctl start crm-enrichment
```

### Competitor Tracker (Scheduled)

Already configured via crontab.txt:
```bash
crontab competitor-tracker/crontab.txt
```

Verify it's scheduled:
```bash
crontab -l
```

## Troubleshooting

### CRM Enrichment
- **Notion errors:** Check integration has database access
- **No search results:** Verify Brave API key has quota
- **Rate limiting:** Increase POLL_INTERVAL_MS in .env

### Competitor Tracker
- **Scraping fails:** Sites may block scrapers; check User-Agent rotation
- **Slack not receiving:** Verify webhook URL is valid
- **Cron not running:** Check logs in `logs/tracker.log`

## Example Outputs

See `EXAMPLE_OUTPUT.md` in each project folder for sample:
- Slack notifications
- Notion enrichment results
- Price history JSON structure

## Maintenance

### Updating Selectors
If a competitor changes their website layout:
1. Update the CSS selectors in `src/sites/[competitor].js`
2. Test with `node src/sites/[competitor].js`
3. Redeploy

### Adding New Competitors
1. Create `src/sites/[name].js` following existing patterns
2. Add to `src/scraper.js` scrapers array
3. Update README

---

Built with ❤️ for Josh's mattress business
