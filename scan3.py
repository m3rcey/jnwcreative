#!/usr/bin/env python3
"""QullaBot Scans 2026-02-13 — Two-phase: fast prefilter then deep dive"""
import yfinance as yf
import pandas as pd
import numpy as np
import time, warnings
warnings.filterwarnings('ignore')

with open('/home/merce/.openclaw/workspace/universe.txt') as f:
    universe = [line.strip() for line in f if line.strip()]
print(f"Universe: {len(universe)}", flush=True)

# PHASE 1: Download 1mo data for ALL symbols to find liquid ones
# 1mo is much faster than 2y
print("\n=== PHASE 1: Quick liquidity screen (1mo data) ===", flush=True)
CHUNK = 200
liquid_syms = []

for i in range(0, len(universe), CHUNK):
    chunk = universe[i:i+CHUNK]
    cn = i//CHUNK + 1
    total = (len(universe)-1)//CHUNK + 1
    print(f"\r  Chunk {cn}/{total} ({len(liquid_syms)} liquid so far)", end='', flush=True)
    try:
        df = yf.download(chunk, period='1mo', interval='1d', progress=False, threads=True, timeout=20)
        if df.empty: continue
        if len(chunk) == 1:
            sym = chunk[0]
            try:
                v = df['Volume'].dropna()
                c = df['Close'].dropna()
                if len(c) >= 5:
                    dv = (v.iloc[-5:] * c.iloc[-5:]).mean()
                    if dv >= 30e6:  # loose prefilter
                        liquid_syms.append(sym)
            except: pass
        else:
            for sym in chunk:
                try:
                    c = df['Close'][sym].dropna()
                    v = df['Volume'][sym].dropna()
                    if len(c) >= 5:
                        dv = (v.iloc[-5:] * c.iloc[-5:]).mean()
                        if dv >= 30e6:
                            liquid_syms.append(sym)
                except: pass
    except: pass
    time.sleep(0.2)

print(f"\n  Found {len(liquid_syms)} liquid stocks (>$30M DV)", flush=True)

# PHASE 2: Download 2y data only for liquid stocks
print(f"\n=== PHASE 2: Deep data for {len(liquid_syms)} liquid stocks ===", flush=True)
all_data = {}
CHUNK2 = 100

for i in range(0, len(liquid_syms), CHUNK2):
    chunk = liquid_syms[i:i+CHUNK2]
    cn = i//CHUNK2 + 1
    total = (len(liquid_syms)-1)//CHUNK2 + 1
    print(f"\r  Chunk {cn}/{total}", end='', flush=True)
    try:
        df = yf.download(chunk, period='2y', interval='1d', progress=False, threads=True, timeout=30)
        if df.empty: continue
        if len(chunk) == 1:
            sym = chunk[0]
            if len(df) >= 20:
                all_data[sym] = {'c': df['Close'].values.flatten(), 'h': df['High'].values.flatten(), 'l': df['Low'].values.flatten(), 'v': df['Volume'].values.flatten()}
        else:
            for sym in chunk:
                try:
                    c = df['Close'][sym].dropna()
                    if len(c) >= 20:
                        all_data[sym] = {
                            'c': c.values.flatten(),
                            'h': df['High'][sym].reindex(c.index).values.flatten(),
                            'l': df['Low'][sym].reindex(c.index).values.flatten(),
                            'v': df['Volume'][sym].reindex(c.index).values.flatten()
                        }
                except: pass
    except: pass
    time.sleep(0.3)

print(f"\n  Got 2y data for {len(all_data)} stocks", flush=True)

# ── COMPUTE METRICS ──
print("\n=== COMPUTING METRICS ===", flush=True)
rows = []
for sym, d in all_data.items():
    try:
        c, h, l, v = d['c'].astype(float), d['h'].astype(float), d['l'].astype(float), d['v'].astype(float)
        n = len(c)
        if n < 20: continue
        last = float(c[-1])
        if last <= 0 or np.isnan(last): continue
        
        dv = float(np.nanmean(v[-20:] * c[-20:]))
        adr = float(np.nanmean((h[-20:] - l[-20:]) / c[-20:] * 100))
        
        def pct(days):
            idx = -(days+1)
            if n >= days+1 and c[idx] > 0:
                return float((last / c[idx] - 1) * 100)
            return np.nan
        
        pk1m = float(np.nanmax(c[-21:])) if n >= 21 else np.nan
        d1m = float((last/pk1m - 1)*100) if not np.isnan(pk1m) and pk1m > 0 else np.nan
        pk3m = float(np.nanmax(c[-63:])) if n >= 63 else np.nan
        d3m = float((last/pk3m - 1)*100) if not np.isnan(pk3m) and pk3m > 0 else np.nan
        
        rows.append({'sym':sym,'last':last,'dv':dv,'adr':adr,
                      'p5':pct(5),'p20':pct(20),'p63':pct(63),'p126':pct(126),
                      'p252':pct(252),'p378':pct(378),'p504':pct(504),
                      'd1m':d1m,'d3m':d3m})
    except: pass

df = pd.DataFrame(rows)
print(f"Metrics for {len(df)} stocks", flush=True)

# ── LEADERSHIP ──
print("\n=== LEADERSHIP SCANS ===", flush=True)
liq = df[(df['dv']>=60e6)&(df['adr']>=2.2)].copy()
print(f"Pass $60M DV + 2.2% ADR: {len(liq)}", flush=True)

leaders = {}
for col, label, pct in [('p20','1m',2),('p63','3m',2),('p126','6m',2),('p252','1y',3),('p378','1.5y',3)]:
    valid = liq[liq[col].notna()]
    n = max(1, int(len(valid)*pct/100))
    top = valid.nlargest(n, col)
    print(f"\n--- {label} Top {pct}% ({n}) ---")
    for _, r in top.head(15).iterrows():
        print(f"  {r['sym']:8s} {r[col]:+8.1f}% DV=${r['dv']/1e6:>7.0f}M ADR={r['adr']:5.1f}%")
    for s in top['sym']:
        leaders[s] = leaders.get(s,0)+1

multi = sorted([(s,c) for s,c in leaders.items() if c>=3], key=lambda x:-x[1])
print(f"\n=== MULTI-TF LEADERS ({len(multi)}) ===")
for s,c in multi[:30]:
    r = liq[liq['sym']==s].iloc[0]
    p = f"1m={r['p20']:+.1f}% 3m={r['p63']:+.1f}%"
    if not np.isnan(r['p126']): p += f" 6m={r['p126']:+.1f}%"
    if not np.isnan(r['p252']): p += f" 1y={r['p252']:+.1f}%"
    print(f"  {s:8s} scans={c} {p} DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# ── 5-DAY GAINERS ──
print("\n=== 5-DAY GAINERS (SHORT CANDIDATES) ===", flush=True)
g5 = df[(df['p5']>=25)&(df['dv']>=60e6)&(df['adr']>=3.0)].sort_values('p5',ascending=False)
for _, r in g5.iterrows():
    flag = "🔥HIGH-PRI" if r['p5']>=50 else ""
    print(f"  {r['sym']:8s} 5d={r['p5']:+.1f}% ${r['last']:.2f} DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}% {flag}")
print(f"Total: {len(g5)}")

# ── LOSERS ──
print("\n=== LOSER SCANS ===", flush=True)
ll = df[(df['dv']>=60e6)&(df['adr']>=2.2)]

for col, label, pct in [('p252','1y',5),('p504','2y',5)]:
    valid = ll[ll[col].notna()]
    n = max(1,int(len(valid)*pct/100))
    bot = valid.nsmallest(n, col)
    sharp = bot[(bot['d1m']<=-40)|(bot['d3m']<=-40)]
    print(f"\n--- {label} weakest {pct}% w/ ≥40% recent drop ({len(sharp)}): ---")
    for _, r in sharp.head(15).iterrows():
        print(f"  {r['sym']:8s} {label}={r[col]:+.1f}% d1m={r['d1m']:.1f}% d3m={r['d3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    print(f"\n--- {label} weakest top 15: ---")
    for _, r in bot.head(15).iterrows():
        print(f"  {r['sym']:8s} {label}={r[col]:+.1f}% d1m={r['d1m']:.1f}% d3m={r['d3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# ── WATCHLIST ──
print("\n=== WATCHLIST UPDATE ===", flush=True)
for sym in ['SMX','EVMN','AXTI','VAL','VRT','CRDO','KD','FLNC','HIMS','MOH','MNDY']:
    m = df[df['sym']==sym]
    if len(m):
        r = m.iloc[0]
        print(f"  {sym:6s} ${r['last']:.2f} 5d={r['p5']:+.1f}% 1m={r['p20']:+.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    else:
        print(f"  {sym:6s} — no data (likely failed DV prefilter)")

print("\n=== SCAN COMPLETE ===", flush=True)
