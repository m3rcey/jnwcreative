#!/usr/bin/env python3
"""QullaBot Scans 2026-02-13 — Using subprocess timeout per chunk"""
import yfinance as yf
import pandas as pd
import numpy as np
import signal, time, warnings, sys, json
warnings.filterwarnings('ignore')

class TimeoutError(Exception): pass
def timeout_handler(signum, frame): raise TimeoutError()

with open('/home/merce/.openclaw/workspace/universe.txt') as f:
    universe = [line.strip() for line in f if line.strip()]
print(f"Universe: {len(universe)}", flush=True)

# Phase 1: quick 1mo screen with per-chunk timeout
print("\n=== PHASE 1: Liquidity screen ===", flush=True)
CHUNK = 150
liquid_syms = set()

for i in range(0, len(universe), CHUNK):
    chunk = universe[i:i+CHUNK]
    cn = i//CHUNK + 1
    total = (len(universe)-1)//CHUNK + 1
    
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(45)  # 45 sec timeout per chunk
    try:
        df = yf.download(chunk, period='1mo', interval='1d', progress=False, threads=True)
        signal.alarm(0)
        if df.empty: continue
        if len(chunk) == 1:
            sym = chunk[0]
            try:
                c = df['Close'].dropna()
                v = df['Volume'].dropna()
                if len(c)>=5 and (v.iloc[-5:]*c.iloc[-5:]).mean() >= 30e6:
                    liquid_syms.add(sym)
            except: pass
        else:
            for sym in chunk:
                try:
                    c = df['Close'][sym].dropna()
                    v = df['Volume'][sym].dropna()
                    if len(c)>=5 and (v.iloc[-5:]*c.iloc[-5:]).mean() >= 30e6:
                        liquid_syms.add(sym)
                except: pass
        print(f"  Chunk {cn}/{total}: {len(liquid_syms)} liquid", flush=True)
    except TimeoutError:
        signal.alarm(0)
        print(f"  Chunk {cn}/{total}: TIMEOUT, skipping", flush=True)
    except Exception as e:
        signal.alarm(0)
        print(f"  Chunk {cn}/{total}: ERROR {e}", flush=True)
    time.sleep(0.3)

signal.alarm(0)
liquid_syms = sorted(liquid_syms)
print(f"\nTotal liquid: {len(liquid_syms)}", flush=True)

# Phase 2: 2y data for liquid stocks
print(f"\n=== PHASE 2: Deep data ({len(liquid_syms)} stocks) ===", flush=True)
all_data = {}
CHUNK2 = 80

for i in range(0, len(liquid_syms), CHUNK2):
    chunk = liquid_syms[i:i+CHUNK2]
    cn = i//CHUNK2 + 1
    total = (len(liquid_syms)-1)//CHUNK2 + 1
    
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(60)
    try:
        df = yf.download(chunk, period='2y', interval='1d', progress=False, threads=True)
        signal.alarm(0)
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
                            'c': c.values.flatten().astype(float),
                            'h': df['High'][sym].reindex(c.index).values.flatten().astype(float),
                            'l': df['Low'][sym].reindex(c.index).values.flatten().astype(float),
                            'v': df['Volume'][sym].reindex(c.index).values.flatten().astype(float)
                        }
                except: pass
        print(f"  Chunk {cn}/{total}: {len(all_data)} total", flush=True)
    except TimeoutError:
        signal.alarm(0)
        print(f"  Chunk {cn}/{total}: TIMEOUT", flush=True)
    except Exception as e:
        signal.alarm(0)
        print(f"  Chunk {cn}/{total}: ERROR {e}", flush=True)
    time.sleep(0.3)

signal.alarm(0)
print(f"\nGot 2y data for {len(all_data)} stocks", flush=True)

# ── COMPUTE ──
print("\n=== COMPUTING ===", flush=True)
rows = []
for sym, d in all_data.items():
    try:
        c, h, l, v = d['c'], d['h'], d['l'], d['v']
        n = len(c)
        if n < 20: continue
        last = float(c[-1])
        if last <= 0 or np.isnan(last): continue
        
        dv = float(np.nanmean(v[-20:] * c[-20:]))
        adr = float(np.nanmean((h[-20:] - l[-20:]) / c[-20:] * 100))
        
        def pct(days):
            if n >= days+1 and c[-(days+1)] > 0:
                return float((last / c[-(days+1)] - 1) * 100)
            return np.nan
        
        pk1m = float(np.nanmax(c[-21:])) if n>=21 else np.nan
        d1m = (last/pk1m-1)*100 if pk1m>0 else np.nan
        pk3m = float(np.nanmax(c[-63:])) if n>=63 else np.nan
        d3m = (last/pk3m-1)*100 if pk3m>0 else np.nan
        
        rows.append({'sym':sym,'last':last,'dv':dv,'adr':adr,
                      'p5':pct(5),'p20':pct(20),'p63':pct(63),'p126':pct(126),
                      'p252':pct(252),'p378':pct(378),'p504':pct(504),
                      'd1m':d1m,'d3m':d3m})
    except: pass

rdf = pd.DataFrame(rows)
print(f"Metrics: {len(rdf)} stocks", flush=True)

# ── OUTPUT ──
liq = rdf[(rdf['dv']>=60e6)&(rdf['adr']>=2.2)].copy()
print(f"\nPass $60M+2.2%ADR: {len(liq)}", flush=True)

# Leadership
leaders = {}
scan_results = {}
for col, label, pct in [('p20','1m',2),('p63','3m',2),('p126','6m',2),('p252','1y',3),('p378','1.5y',3)]:
    valid = liq[liq[col].notna()]
    n = max(1, int(len(valid)*pct/100))
    top = valid.nlargest(n, col)
    scan_results[label] = top[['sym',col,'dv','adr','last']].to_dict('records')
    print(f"\n--- {label} Top {pct}% ({n}) ---")
    for _, r in top.head(15).iterrows():
        print(f"  {r['sym']:8s} {r[col]:+8.1f}% DV=${r['dv']/1e6:>6.0f}M ADR={r['adr']:5.1f}%")
    for s in top['sym']:
        leaders[s] = leaders.get(s,0)+1

multi = sorted([(s,c) for s,c in leaders.items() if c>=3], key=lambda x:-x[1])
print(f"\n=== MULTI-TF LEADERS ({len(multi)}) ===")
for s,c in multi[:30]:
    r = liq[liq['sym']==s].iloc[0]
    p = f"1m={r['p20']:+.1f}%"
    if not np.isnan(r['p63']): p += f" 3m={r['p63']:+.1f}%"
    if not np.isnan(r['p126']): p += f" 6m={r['p126']:+.1f}%"
    if not np.isnan(r['p252']): p += f" 1y={r['p252']:+.1f}%"
    print(f"  {s:8s} scans={c} {p} DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# 5-day gainers
print("\n=== 5-DAY GAINERS ===")
g5 = rdf[(rdf['p5']>=25)&(rdf['dv']>=60e6)&(rdf['adr']>=3.0)].sort_values('p5',ascending=False)
for _, r in g5.iterrows():
    f = "🔥" if r['p5']>=50 else ""
    print(f"  {r['sym']:8s} 5d={r['p5']:+.1f}% ${r['last']:.2f} DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}% {f}")
print(f"Total: {len(g5)}")

# Losers
print("\n=== LOSERS ===")
ll = rdf[(rdf['dv']>=60e6)&(rdf['adr']>=2.2)]
for col, label, pct in [('p252','1y',5),('p504','2y',5)]:
    valid = ll[ll[col].notna()]
    n = max(1,int(len(valid)*pct/100))
    bot = valid.nsmallest(n, col)
    sharp = bot[(bot['d1m']<=-40)|(bot['d3m']<=-40)]
    print(f"\n--- {label} weakest w/ ≥40% drop ({len(sharp)}): ---")
    for _, r in sharp.head(15).iterrows():
        print(f"  {r['sym']:8s} {label}={r[col]:+.1f}% d1m={r['d1m']:.1f}% d3m={r['d3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    print(f"\n--- {label} weakest top 15 all: ---")
    for _, r in bot.head(15).iterrows():
        print(f"  {r['sym']:8s} {label}={r[col]:+.1f}% d1m={r['d1m']:.1f}% d3m={r['d3m']:.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")

# Watchlist
print("\n=== WATCHLIST ===")
for sym in ['SMX','EVMN','AXTI','VAL','VRT','CRDO','KD','FLNC','HIMS','MOH','MNDY']:
    m = rdf[rdf['sym']==sym]
    if len(m):
        r = m.iloc[0]
        print(f"  {sym:6s} ${r['last']:.2f} 5d={r['p5']:+.1f}% 1m={r['p20']:+.1f}% DV=${r['dv']/1e6:.0f}M ADR={r['adr']:.1f}%")
    else:
        print(f"  {sym:6s} — no data")

# Save results for report
save = {
    'multi': [(s,c) for s,c in multi[:30]],
    'g5': g5[['sym','p5','dv','adr','last']].to_dict('records') if len(g5) else [],
}
with open('/home/merce/.openclaw/workspace/scan_results.json','w') as f:
    json.dump(save, f, default=str)

print("\n=== DONE ===", flush=True)
