# TOOLS.md - Trading Tool Configuration

## Broker: Alpaca

**Paper Trading Endpoint:** https://paper-api.alpaca.markets
**Live Endpoint:** https://api.alpaca.markets (DO NOT USE until user explicitly approves)

**Current Mode: PAPER TRADING**

### API Credentials
Stored in environment variables:
- `ALPACA_API_KEY` — API Key ID
- `ALPACA_SECRET_KEY` — Secret Key
- `ALPACA_BASE_URL` — Currently set to paper endpoint

### Common Operations

**Get account info:**
```python
from alpaca_trade_api import REST
import os

api = REST(
    key_id=os.environ['ALPACA_API_KEY'],
    secret_key=os.environ['ALPACA_SECRET_KEY'],
    base_url=os.environ['ALPACA_BASE_URL']
)
account = api.get_account()
equity = float(account.equity)
buying_power = float(account.buying_power)
```

**Get positions:**
```python
positions = api.list_positions()
for p in positions:
    print(f"{p.symbol}: {p.qty} shares @ {p.avg_entry_price}, P&L: {p.unrealized_pl}")
```

**Place a buy order:**
```python
api.submit_order(
    symbol='NVDA',
    qty=100,
    side='buy',
    type='market',
    time_in_force='day'
)
```

**Place a stop loss:**
```python
api.submit_order(
    symbol='NVDA',
    qty=100,
    side='sell',
    type='stop',
    stop_price=141.80,
    time_in_force='gtc'
)
```

**Cancel an order:**
```python
api.cancel_order(order_id)
```

## Market Data: Yahoo Finance (yfinance)

Free daily OHLCV for all US equities. No API key needed.

```python
import yfinance as yf
import pandas as pd

# Single stock
data = yf.download("NVDA", period="6mo", interval="1d")

# Multiple stocks
data = yf.download(["NVDA", "AAPL", "TSLA"], period="6mo", interval="1d")

# Calculate moving averages
data['MA10'] = data['Close'].rolling(10).mean()
data['MA20'] = data['Close'].rolling(20).mean()
data['MA50'] = data['Close'].rolling(50).mean()

# Calculate ADR%
data['ADR_pct'] = ((data['High'] - data['Low']) / data['Close'] * 100).rolling(20).mean()

# Calculate dollar volume
data['DollarVol'] = data['Volume'] * data['Close']
data['AvgDollarVol'] = data['DollarVol'].rolling(20).mean()
```

### Getting the Full Stock Universe
```python
# Option 1: Use a pre-built list
# Download NASDAQ and NYSE listed stocks from:
# https://www.nasdaq.com/market-activity/stocks/screener (export CSV)

# Option 2: Use the Alpaca API
assets = api.list_assets(status='active')
us_stocks = [a for a in assets if a.exchange in ('NASDAQ', 'NYSE') and a.tradable]
symbols = [a.symbol for a in us_stocks]
```

## Earnings Calendar

**Primary source:** Search the web for earnings dates.
- Check earningswhispers.com for upcoming dates
- Check finance.yahoo.com/calendar/earnings for the weekly calendar
- Check the Alpaca news API for recent earnings announcements

**Important:** Check earnings calendar EVERY MORNING at 8:00 AM ET for all open positions and watchlist stocks.

## Indicators to Calculate

All calculated from daily OHLCV data:

| Indicator | Formula |
|-----------|---------|
| 10-day SMA | Close.rolling(10).mean() |
| 20-day SMA | Close.rolling(20).mean() |
| 50-day SMA | Close.rolling(50).mean() |
| 200-day SMA | Close.rolling(200).mean() |
| 10-day EMA | Close.ewm(span=10).mean() |
| 20-day EMA | Close.ewm(span=20).mean() |
| ADR% | ((High-Low)/Close * 100).rolling(20).mean() |
| ATR | 14-day average true range |
| Dollar Volume | Volume × Close, averaged over 20 days |
| RS vs SPY | (Stock % change N days) / (SPY % change N days) |
| Volume Ratio | Today's volume / 20-day avg volume |

## Notes
- yfinance can be slow for bulk downloads (6000+ stocks). Consider batching.
- For faster data, consider Polygon.io (free tier) or Alpha Vantage (free key).
- Always handle API errors gracefully — markets close, data has gaps.
