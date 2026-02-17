# Competitor Price & Policy Tracker

Monitors mattress competitors daily and sends Slack alerts for price changes and new promotions.

## Competitors Monitored

### Direct Brands
- **Saatva** (saatva.com) - Luxury hybrid mattresses
- **Casper** (casper.com) - Memory foam and hybrid
- **Sleep Number** (sleepnumber.com) - Adjustable air beds
- **Helix** (helixsleep.com) - Customized hybrid mattresses

### Retailers
- **Ashley Furniture** (ashleyfurniture.com) - Major furniture retailer
- **Macy's** (macys.com) - Department store mattresses
- **Costco** (costco.com) - Wholesale mattress selection

> **Note:** Mattress Firm is intentionally excluded as it's Josh's employer.

## Data Tracked

- **Prices:** Hybrid mattresses, memory foam, adjustable bases
- **Return Policies:** Trial periods, return conditions
- **Warranty Terms:** Coverage length and terms
- **Promotions:** Current sales, discounts, special offers

## Setup Instructions

### 1. Install Dependencies

```bash
cd /home/merce/.openclaw/workspace/competitor-tracker
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
# Slack Webhook for notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional: Slack channel override
SLACK_CHANNEL=#competitor-alerts
```

### 3. Set Up Slack Webhook

1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. Add Incoming Webhooks
4. Activate Incoming Webhooks
5. Add New Webhook to Workspace
6. Copy the Webhook URL to `SLACK_WEBHOOK_URL`

### 4. Run Manually

```bash
# Run full scrape and comparison
npm start

# Just scrape (no comparison/notification)
npm run scrape

# Just compare and notify (requires existing data)
npm run compare
```

### 5. Schedule with Cron

Add to crontab for daily 8:00 AM CT runs:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 8:00 AM Central Time daily)
0 8 * * * cd /home/merce/.openclaw/workspace/competitor-tracker && /usr/bin/node src/index.js >> logs/tracker.log 2>&1
```

Or use the provided crontab file:
```bash
crontab crontab.txt
```

## Output Format

### Daily Slack Message Example:

```
🛏️ Daily Competitor Report - Feb 14, 2026

📊 PRICE CHANGES:
• Saatva Classic Queen: $1,595 → $1,495 (-$100) 🔽
• Casper Wave Hybrid King: $2,995 → $3,195 (+$200) 🔼

🎉 NEW PROMOTIONS:
• Helix: "Presidents' Day Sale - $200 off + 2 free pillows"
• Sleep Number: "Save $800 on i8 Smart Bed"

📋 POLICY UPDATES:
• Ashley Furniture: Trial period extended from 100 to 120 nights

Reply DETAILED for full comparison table
```

## Data Storage

Price history is stored in JSON format:

```json
{
  "lastUpdated": "2026-02-14T08:00:00Z",
  "competitors": {
    "saatva": {
      "products": [...],
      "policies": {...},
      "promotions": [...]
    },
    ...
  }
}
```

## File Structure

```
competitor-tracker/
├── src/
│   ├── index.js          # Main entry point
│   ├── scraper.js        # Web scraping logic
│   ├── compare.js        # Price comparison engine
│   ├── slack.js          # Slack notification sender
│   ├── sites/            # Site-specific scrapers
│   │   ├── saatva.js
│   │   ├── casper.js
│   │   ├── sleepnumber.js
│   │   ├── helix.js
│   │   ├── ashley.js
│   │   ├── macys.js
│   │   └── costco.js
│   └── test.js           # Test utilities
├── data/
│   └── history.json      # Price history storage
├── logs/
│   └── tracker.log       # Execution logs
├── crontab.txt           # Cron configuration
├── .env                  # Environment variables
├── .env.example          # Example env file
├── package.json
└── README.md
```

## Site-Specific Notes

### Saatva
- Uses JavaScript-rendered content
- May require Puppeteer/Playwright for full scraping
- Current implementation uses static HTML fallback

### Casper
- Well-structured HTML
- Prices in `data-price` attributes
- Sales banners in `.promotion-banner`

### Sleep Number
- Dynamic pricing via API calls
- Prices loaded via JavaScript
- May need API reverse engineering

### Helix
- Shopify-based store
- Clean HTML structure
- Prices in `.product-price` elements

### Ashley Furniture
- Large product catalog
- Pagination required for full scrape
- Focus on mattress category pages

### Macy's
- Department store layout
- Multiple mattress brands
- Filter by "mattresses" category

### Costco
- Members-only pricing visible
- Limited mattress selection
- Focus on major brands (Sealy, Tempur-Pedic)

## Troubleshooting

**No data returned:** Check if site blocks scrapers; may need User-Agent rotation

**Price format changed:** Site may have updated HTML structure; update selector

**Slack not receiving:** Verify webhook URL is correct and channel exists

**Cron not running:** Check `logs/tracker.log` for errors; ensure Node path is correct

## Extending

To add a new competitor:

1. Create `src/sites/[competitor].js`
2. Implement `scrape()` function returning standard format
3. Add to `src/scraper.js` competitor list
4. Update this README
