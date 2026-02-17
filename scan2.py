#!/usr/bin/env python3
"""QullaBot Pre-Market Scans — 2026-02-13 (optimized)"""
import yfinance as yf
import pandas as pd
import numpy as np
import time, warnings, sys
warnings.filterwarnings('ignore')

with open('/home/merce/.openclaw/workspace/universe.txt') as f:
    universe = [line.strip() for line in f if line.strip()]
print(f"Universe: {len(universe)} symbols", flush=True)

# ── 1. REGIME ──
print("\n=== REGIME CHECK ===", flush=True)
idx = yf.download(['SPY','QQQ'], period='3mo', interval='1d', progress=False)
for sym in ['SPY','QQQ']:
    c = idx['Close'][sym].dropna()
    ma10 = c.rolling(10).mean()
    ma20 = c.rolling(20).mean()
    s10 = ma10.iloc[-1] - ma10.iloc[-3]
    s20 = ma20.iloc[-1] - ma20.iloc[-3]
    above = ma10.iloc[-1] > ma20.iloc[-1]
    print(f"{sym}: ${c.iloc[-1]:.2f} MA10={ma10.iloc[-1]:.2f}({'↑' if s10>0 else '↓'}) MA20={ma20.iloc[-1]:.2f}({'↑' if s20>0 else '↓'}) 10>20={above}", flush=True)

# ── BULK DOWNLOAD ──
# Use period=2y, chunk=100
CHUNK = 100
all_data = {}

for i in range(0, len(universe), CHUNK):
    chunk = universe[i:i+CHUNK]
    cn = i//CHUNK+1
    total = (len(universe)-1)//CHUNK+1
    print(f"\rChunk {cn}/{total}", end='', flush=True)
    for attempt in range(2):
        try:
            df = yf.download(chunk, period='2y', interval='1d', progress=False, threads=True, timeout=30)
            if df.empty:
                break
            if len(chunk) == 1:
                sym = chunk[0]
                if len(df) >= 20:
                    all_data[sym] = {'c': df['Close'].values, 'h': df['High'].values, 'l': df['Low'].values, 'v': df['Volume'].values}
            else:
                for sym in chunk:
                    try:
                        c = df['Close'][sym].dropna()
                        if len(c) >= 20:
                            h = df['High'][sym].reindex(c.index).values
                            l = df['Low'][sym].reindex(c.index).values
                            v = df['Volume'][sym].reindex(c.index).values
                            all_data[sym] = {'c': c.values, 'h': h, 'l': l, 'v': v}
                    except:
                        pass
            break
        except Exception as e:
            if attempt == 0:
                time.sleep(2)
    time.sleep(0.3)

print(f"\nGot data for {len(all_data)} symbols", flush=True)

# ── COMPUTE ──
print("\n=== COMPUTING ===", flush=True)
rows = []
for sym, d in all_data.items():
    try:
        c, h, l, v = d['c'], d['h'], d['l'], d['v']
        n = len(c)
        if n < 20: continue
        last = c[-1]
        if last <= 0 or np.isnan(last): continue
        
        dv = np.nanmean(v[-20:] * c[-20:])
        adr = np.nanmean((h[-20:] - l[-20:]) / c[-20:] * 100)
        
        def pct(days):
            idx = -(days+1)
            return (last / c[idx] - 1) * 100 if n >= days+1 and c[idx] > 0 else np.nan
        
        p5, p20, p63, p126, p252, p378, p504 = pct(5), pct(20), pct(63), pct(126), pct(252), pct(378), pct(504)
        
        pk1m = np.nanmax(c[-21:]) if n >= 21 else np.nan
        d1m = (last/pk1m - 1)*100 if pk1m > 0 else np.nan
        pk3m = np.nanmax(c[-63:]) if n >= 63 else np.nan
        d3m = (last/pk3m - 1)*100 if pk3m > 0 else np.nan
        
        rows.append({'sym':sym,'last':last,'dv':dv,'adr':adr,'p5':p5,'p20':p20,'p63':p63,'p126':p126,'p252':p252,'p378':p378,'p504':p504,'d1m':d1m,'d3m':d3m})
    except:
        pass

df = pd.DataFrame(rows)
print(f"Metrics for {len(df)} stocks", flush=True)

# ── LEADERSHIP ──
print("\n=== LEADERSHIP SCANS ===", flush=True)
liq = df[(df['dv']>=60e6)&(df['adr']>=2.2)].copy()
print(f"Liquidity filter: {len(liq)} stocks", flush=True)

leaders = {}
for col, label, pct in [('p20','1m',2),('p63','3m',2),('p126','6m',2),('p252','1y',3),('p378','1.5y',3)]:
    valid = liq[liq[col].notna()]
    n = max(1, int(len(valid)*pct/100))
    top = valid.nlargest(n, col)
    print(f"\n--- {label} Top {pct}% ({n}) top 10: ---")
    for _, r in top.head(10).iterrows():
        print(f"  {r['sym']:6s} {r[col]:+7.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    for s in top['sym']:
        leaders[s] = leaders.get(s,0)+1

multi = sorted([(s,c) for s,c in leaders.items() if c>=3], key=lambda x:-x[1])
print(f"\n=== MULTI-TF LEADERS ({len(multi)}) ===")
for s,c in multi[:25]:
    r = liq[liq['sym']==s].iloc[0]
    cols = f"1m={r['p20']:+.1f}% 3m={r['p63']:+.1f}%" 
    if not np.isnan(r['p126']): cols += f" 6m={r['p126']:+.1f}%"
    print(f"  {s:6s} scans={c} {cols} DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# ── 5-DAY GAINERS ──
print("\n=== 5-DAY GAINERS (SHORT CANDIDATES) ===", flush=True)
g5 = df[(df['p5']>=25)&(df['dv']>=60e6)&(df['adr']>=3.0)].sort_values('p5',ascending=False)
for _, r in g5.iterrows():
    flag = "🔥 HIGH-PRI" if r['p5']>=50 else ""
    print(f"  {r['sym']:6s} 5d={r['p5']:+.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}% ${r['last']:.2f} {flag}")
print(f"  Total: {len(g5)}")

# ── LOSERS ──
print("\n=== LOSER SCANS (MEAN-REVERSION) ===", flush=True)
ll = df[(df['dv']>=60e6)&(df['adr']>=2.2)].copy()

for col, label, pct in [('p252','1y',5),('p504','2y',5)]:
    valid = ll[ll[col].notna()]
    n = max(1,int(len(valid)*pct/100))
    bot = valid.nsmallest(n, col)
    sharp = bot[(bot['d1m']<=-40)|(bot['d3m']<=-40)]
    print(f"\n--- {label} weakest {pct}% with ≥40% recent drop: {len(sharp)} ---")
    for _, r in sharp.head(15).iterrows():
        print(f"  {r['sym']:6s} {label}={r[col]:+.1f}% d1m={r['d1m']:.1f}% d3m={r['d3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    
    # Show top 15 losers regardless
    print(f"\n--- {label} weakest {pct}% top 15 (any): ---")
    for _, r in bot.head(15).iterrows():
        print(f"  {r['sym']:6s} {label}={r[col]:+.1f}% d1m={r['d1m']:.1f}% d3m={r['d3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# ── WATCHLIST CHECK ──
print("\n=== WATCHLIST STOCKS ===", flush=True)
for sym in ['SMX','EVMN','AXTI','VAL','VRT','CRDO','KD','FLNC','HIMS','MOH','MNDY']:
    m = df[df['sym']==sym]
    if len(m):
        r = m.iloc[0]
        print(f"  {sym:6s} ${r['last']:.2f} 5d={r['p5']:+.1f}% 1m={r['p20']:+.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    else:
        print(f"  {sym:6s} — no data")

print("\n=== DONE ===", flush=True)
