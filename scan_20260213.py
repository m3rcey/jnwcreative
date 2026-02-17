#!/usr/bin/env python3
"""QullaBot Pre-Market Scans — 2026-02-13"""

import yfinance as yf
import pandas as pd
import numpy as np
import json, sys, time, warnings
warnings.filterwarnings('ignore')

# Load universe
with open('/home/merce/.openclaw/workspace/universe.txt') as f:
    universe = [line.strip() for line in f if line.strip()]
print(f"Universe: {len(universe)} symbols")

# ── 1. REGIME CHECK ──────────────────────────────────────────────
print("\n=== REGIME CHECK ===")
idx_data = yf.download(['SPY','QQQ'], period='3mo', interval='1d', progress=False)
for sym in ['SPY','QQQ']:
    c = idx_data['Close'][sym].dropna()
    ma10 = c.rolling(10).mean()
    ma20 = c.rolling(20).mean()
    slope10 = ma10.iloc[-1] - ma10.iloc[-3]
    slope20 = ma20.iloc[-1] - ma20.iloc[-3]
    above = ma10.iloc[-1] > ma20.iloc[-1]
    print(f"{sym}: Close={c.iloc[-1]:.2f} MA10={ma10.iloc[-1]:.2f}({'↑' if slope10>0 else '↓'}) MA20={ma20.iloc[-1]:.2f}({'↑' if slope20>0 else '↓'}) 10>20={above}")
    print(f"  50MA={c.rolling(50).mean().iloc[-1]:.2f} 200MA={c.rolling(200).mean().iloc[-1] if len(c)>=200 else 'N/A'}")

# ── 2-4. BULK DATA DOWNLOAD ──────────────────────────────────────
# Download in chunks of 150, get 2 years of data
CHUNK = 150
all_close = {}
all_high = {}
all_low = {}
all_vol = {}

for i in range(0, len(universe), CHUNK):
    chunk = universe[i:i+CHUNK]
    label = f"Chunk {i//CHUNK+1}/{(len(universe)-1)//CHUNK+1} ({len(chunk)} syms)"
    print(f"\rDownloading {label}...", end='', flush=True)
    try:
        df = yf.download(chunk, period='2y', interval='1d', progress=False, threads=True)
        if df.empty:
            continue
        # Handle single vs multi stock
        if len(chunk) == 1:
            sym = chunk[0]
            all_close[sym] = df['Close']
            all_high[sym] = df['High']
            all_low[sym] = df['Low']
            all_vol[sym] = df['Volume']
        else:
            for sym in chunk:
                try:
                    c = df['Close'][sym].dropna()
                    if len(c) >= 20:
                        all_close[sym] = c
                        all_high[sym] = df['High'][sym].dropna()
                        all_low[sym] = df['Low'][sym].dropna()
                        all_vol[sym] = df['Volume'][sym].dropna()
                except:
                    pass
    except Exception as e:
        print(f"\n  Error on chunk: {e}")
    time.sleep(0.5)

print(f"\nDownloaded data for {len(all_close)} symbols")

# ── COMPUTE METRICS ──────────────────────────────────────────────
print("\n=== COMPUTING METRICS ===")
results = []
for sym in all_close:
    try:
        c = all_close[sym]
        h = all_high[sym]
        l = all_low[sym]
        v = all_vol[sym]
        if len(c) < 20:
            continue
        
        last = c.iloc[-1]
        # Dollar volume (20d avg)
        dv = (v.iloc[-20:] * c.iloc[-20:]).mean()
        # ADR% (20d avg)
        adr = ((h.iloc[-20:] - l.iloc[-20:]) / c.iloc[-20:] * 100).mean()
        
        # % changes
        pct5 = (last / c.iloc[-6] - 1) * 100 if len(c) >= 6 else np.nan
        pct20 = (last / c.iloc[-21] - 1) * 100 if len(c) >= 21 else np.nan
        pct63 = (last / c.iloc[-64] - 1) * 100 if len(c) >= 64 else np.nan
        pct126 = (last / c.iloc[-127] - 1) * 100 if len(c) >= 127 else np.nan
        pct252 = (last / c.iloc[-253] - 1) * 100 if len(c) >= 253 else np.nan
        pct378 = (last / c.iloc[-379] - 1) * 100 if len(c) >= 379 else np.nan
        pct504 = (last / c.iloc[-505] - 1) * 100 if len(c) >= 505 else np.nan
        
        # Recent drop (max of 1m and 3m drops from peak)
        peak_1m = c.iloc[-21:].max() if len(c) >= 21 else np.nan
        drop_1m = (last / peak_1m - 1) * 100 if not np.isnan(peak_1m) else np.nan
        peak_3m = c.iloc[-63:].max() if len(c) >= 63 else np.nan
        drop_3m = (last / peak_3m - 1) * 100 if not np.isnan(peak_3m) else np.nan
        
        results.append({
            'sym': sym, 'last': last, 'dv': dv, 'adr': adr,
            'pct5': pct5, 'pct20': pct20, 'pct63': pct63,
            'pct126': pct126, 'pct252': pct252, 'pct378': pct378,
            'pct504': pct504, 'drop_1m': drop_1m, 'drop_3m': drop_3m
        })
    except:
        pass

df = pd.DataFrame(results)
print(f"Computed metrics for {len(df)} stocks")

# ── LEADERSHIP SCANS ─────────────────────────────────────────────
print("\n=== LEADERSHIP SCANS ===")
liq = df[(df['dv'] >= 60e6) & (df['adr'] >= 2.2)].copy()
print(f"Passed liquidity filter: {len(liq)}")

leaders = {}
for col, label, pct in [('pct20','1m',2),('pct63','3m',2),('pct126','6m',2),('pct252','1y',3),('pct378','1.5y',3)]:
    valid = liq[liq[col].notna()].copy()
    n = max(1, int(len(valid) * pct / 100))
    top = valid.nlargest(n, col)
    print(f"\n{label} Top {pct}% ({n} stocks):")
    for _, r in top.head(10).iterrows():
        print(f"  {r['sym']:6s} {r[col]:+7.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    for s in top['sym']:
        leaders[s] = leaders.get(s, 0) + 1

# Multi-timeframe overlap
multi = {s: c for s, c in leaders.items() if c >= 3}
multi_sorted = sorted(multi.items(), key=lambda x: -x[1])
print(f"\n=== MULTI-TIMEFRAME LEADERS (3+ scans): {len(multi_sorted)} ===")
for s, c in multi_sorted[:30]:
    row = liq[liq['sym']==s].iloc[0]
    print(f"  {s:6s} scans={c} 1m={row['pct20']:+.1f}% 3m={row['pct63']:+.1f}% 6m={row['pct126']:+.1f}% DV=${row['dv']/1e6:.0f}M ADR={row['adr']:.1f}%")

# ── 5-DAY GAINER SCAN ────────────────────────────────────────────
print("\n=== 5-DAY GAINER SCAN (SHORT CANDIDATES) ===")
gainer5 = df[(df['pct5'] >= 25) & (df['dv'] >= 60e6) & (df['adr'] >= 3.0)].sort_values('pct5', ascending=False)
for _, r in gainer5.iterrows():
    flag = "🔥 HIGH-PRI" if r['pct5'] >= 50 else ""
    print(f"  {r['sym']:6s} 5d={r['pct5']:+.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}% {flag}")

# ── LOSER SCANS ───────────────────────────────────────────────────
print("\n=== LOSER SCANS (MEAN-REVERSION LONG) ===")
loser_liq = df[(df['dv'] >= 60e6) & (df['adr'] >= 2.2)].copy()

for col, label, pct in [('pct252','1y',5),('pct504','2y',5)]:
    valid = loser_liq[loser_liq[col].notna()].copy()
    n = max(1, int(len(valid) * pct / 100))
    bottom = valid.nsmallest(n, col)
    # Filter for sharp recent decline
    sharp = bottom[(bottom['drop_1m'] <= -40) | (bottom['drop_3m'] <= -40)]
    print(f"\n{label} Weakest {pct}% with ≥40% recent drop ({len(sharp)} stocks):")
    for _, r in sharp.head(15).iterrows():
        print(f"  {r['sym']:6s} {label}={r[col]:+.1f}% drop1m={r['drop_1m']:.1f}% drop3m={r['drop_3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# Also show weakest without the sharp drop filter for reference
for col, label, pct in [('pct252','1y',5),]:
    valid = loser_liq[loser_liq[col].notna()].copy()
    n = max(1, int(len(valid) * pct / 100))
    bottom = valid.nsmallest(n, col)
    print(f"\n{label} Weakest {pct}% ALL ({n} stocks, top 15):")
    for _, r in bottom.head(15).iterrows():
        print(f"  {r['sym']:6s} 1y={r[col]:+.1f}% drop1m={r['drop_1m']:.1f}% drop3m={r['drop_3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# ── WATCHLIST UPDATE CHECK ────────────────────────────────────────
print("\n=== EXISTING WATCHLIST UPDATE ===")
watchlist = ['SMX','EVMN','AXTI','VAL','VRT','CRDO','KD','FLNC','HIMS','MOH','MNDY']
for sym in watchlist:
    match = df[df['sym']==sym]
    if len(match):
        r = match.iloc[0]
        print(f"  {sym:6s} last=${r['last']:.2f} 5d={r['pct5']:+.1f}% 1m={r['pct20']:+.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    else:
        print(f"  {sym:6s} — no data")

# ── SAVE RAW DATA ─────────────────────────────────────────────────
# Save key results for report generation
output = {
    'multi_leaders': multi_sorted[:30],
    'gainer5': gainer5[['sym','pct5','dv','adr','last']].to_dict('records'),
    'regime_note': 'Check console output above'
}
with open('/home/merce/.openclaw/workspace/scan_results.json', 'w') as f:
    json.dump(output, f, default=str)

print("\n=== SCAN COMPLETE ===")
