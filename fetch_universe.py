from alpaca_trade_api import REST
import os

# Connect to Alpaca API
api = REST(
    key_id=os.environ['ALPACA_API_KEY'],
    secret_key=os.environ['ALPACA_SECRET_KEY'],
    base_url=os.environ['ALPACA_BASE_URL']
)

print("Fetching all assets from Alpaca...")

# Get all active assets
assets = api.list_assets(status='active')

print(f"Total active assets: {len(assets)}")

# Filter: NYSE or NASDAQ, tradable, common stocks only (no ETFs, warrants, etc.)
us_stocks = []
for a in assets:
    # Exchange filter
    if a.exchange not in ('NASDAQ', 'NYSE'):
        continue
    
    # Must be tradable
    if not a.tradable:
        continue
    
    # Asset class must be 'us_equity'
    if a.asset_class != 'us_equity':
        continue
    
    # Filter out ETFs, ETNs, warrants, etc. by checking asset_class
    # us_equity covers common stocks; ETFs are often separate but let's be thorough
    # Also check for common stock indicators in name or symbol patterns if needed
    
    us_stocks.append(a)

# Extract symbols and sort
symbols = sorted([a.symbol for a in us_stocks])

print(f"Filtered to NYSE/NASDAQ common stocks: {len(symbols)}")

# Write to file
with open('universe.txt', 'w') as f:
    for sym in symbols:
        f.write(sym + '\n')

print(f"Saved {len(symbols)} symbols to universe.txt")

# Show first 10 and last 10 for verification
print(f"\nFirst 10: {symbols[:10]}")
print(f"Last 10: {symbols[-10:]}")
