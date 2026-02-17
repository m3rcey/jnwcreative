# HEARTBEAT.md - QullaBot Trading Heartbeat

When you receive a heartbeat poll, check the current time (use session_status) and execute the appropriate task.

## Trading Hours Checklist (ET)

**If 7:30-8:15 AM ET (Pre-Market Scans):**
- Run all daily leadership scans (1m, 3m, 6m, 1yr, 1.5yr)
- Run 5-day gainer scan, loser scans, IPO scan
- Update Momentum Universe Watchlist in MEMORY.md
- Check earnings calendar for all open positions and watchlist stocks
- Alert user if any open position has earnings within 5 days

**If 8:15-8:45 AM ET (EP Scan):**
- Scan pre-market gappers for Episodic Pivot candidates (gap ≥ 10%, heavy volume)
- Research catalyst for any EP candidates
- Prepare EP trade proposals if candidates qualify

**If 8:45-9:15 AM ET (Regime + Briefing):**
- Run market regime check (SPY/QQQ 10/20 MA alignment)
- Declare Breakout ON or OFF
- Calculate current portfolio heat
- Send pre-market briefing to Slack with: regime, active setups, EP candidates, positions to manage, heat

**If 9:30-10:30 AM ET (Execution Window):**
- Monitor EP candidates for opening range breaks
- Monitor breakout candidates for daily level breaks with volume
- Submit trade proposals for any qualifying setups
- Execute approved trades

**If 10:30 AM-2:00 PM ET (Monitoring):**
- Monitor open positions
- Run intraday scan for new movers at ~10:00 AM
- No new entries unless clear late-morning breakout with volume

**If 2:00-3:30 PM ET (Afternoon):**
- Run afternoon scan
- Check for earnings conflicts on open positions
- Assess if any positions need pre-earnings exits

**If 3:30-4:00 PM ET (Pre-Close):**
- Check all positions for potential closes below trailing MAs
- Flag any positions that need exit tomorrow
- Prepare end-of-day data

**If 4:00-4:30 PM ET (Post-Close):**
- Record all closing prices
- Update P&L in MEMORY.md
- Calculate end-of-day portfolio heat
- Generate Daily Summary Report → send to Slack
- Check after-hours earnings for tomorrow's EP scan
- Update pattern library with today's trades/rejections
- Run feedback loop

**If Friday 4:30 PM ET:**
- Generate Weekly Summary Report → send to Slack

## Non-Market Hours (4:30 PM - 7:30 AM ET)

- Check if any after-hours earnings announcements create EP candidates for tomorrow
- Update MEMORY.md with any relevant notes
- Otherwise: HEARTBEAT_OK

## Weekends

- HEARTBEAT_OK (no trading)
- Exception: If user sends a message, respond normally

## Priority Alerts (Override Normal Schedule)

Always alert immediately, regardless of schedule, if:
- A stop loss is hit on an open position
- Portfolio heat exceeds 10%
- A circuit breaker threshold is breached
- Market regime changes mid-day
- An open position has earnings TOMORROW and hasn't been managed yet
