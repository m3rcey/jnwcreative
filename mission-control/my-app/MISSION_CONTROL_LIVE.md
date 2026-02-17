# 🚀 Mission Control - LIVE

## 📱 Mobile Access URL
**https://programmes-separation-calvin-kitty.trycloudflare.com**

⚠️ Cloudflare URLs are temporary. If this expires, run `./mobile-access.sh` to get a new one.

✅ Open this URL on your phone right now — it works from anywhere

---

## 🖥️ Local Access
- **Dashboard**: http://localhost:3456
- **API**: http://localhost:3456/api/stats

---

## 📋 What's Built

### Dashboard (`/`)
- Real-time system stats (agents, approvals, workflows, tools)
- Activity feed showing recent actions
- Quick action buttons to spawn agents, create tools, etc.

### Agents (`/agents` - click Agents in sidebar)
- View all sub-agents (QullaBot, Trade Executor, Risk Monitor)
- See status, tasks, progress bars
- Spawn new agents (UI ready, needs backend hook)

### Tools (`/tools` - click Tools in sidebar)
- Manage custom automation tools
- Current tools: Market Scanner, EP Detector, Slack Notifier, Weather Check
- Build new tools (UI ready)

### Approvals (`/approvals` - click Approvals in sidebar)
- Queue of pending actions needing your approval
- Current items:
  - NVDA Long Breakout trade (HIGH priority)
  - Update Circuit Breaker settings
- Approve/Reject buttons work in real-time

### Workflows (`/workflows` - click Workflows in sidebar)
- Automation workflows with triggers
- Current workflows:
  - Daily Market Open (runs at 8 AM weekdays)
  - Earnings Alert (checks for conflicts daily)
- Create new workflows with visual builder

---

## 🔧 How to Use

### From Your Phone
1. Open: https://allow-talented-properly-request.trycloudflare.com
2. The sidebar becomes a hamburger menu (top left)
3. Works on any device, anywhere

### Restarting the Server
```bash
cd /home/merce/.openclaw/workspace/mission-control/my-app

# Start locally only
npm run dev

# Start with mobile access
./mobile-access.sh cloudflare
```

### Adding Real Integrations

To connect to actual OpenClaw agents:

1. **Edit** `src/lib/store.ts` 
2. **Replace** mock data with actual API calls to OpenClaw
3. **Example** for spawning agents:
```typescript
async spawnAgent(task: string) {
  const response = await fetch('http://localhost:YOUR_OPENCLAW_PORT/spawn', {
    method: 'POST',
    body: JSON.stringify({ task })
  })
  return response.json()
}
```

---

## 🎨 Tech Stack

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Cloudflare Tunnel** — Mobile access (no account needed)
- **In-memory store** — Data persistence (swappable for SQLite/Postgres)

---

## 📁 Project Location
`/home/merce/.openclaw/workspace/mission-control/my-app`

---

## 🔄 Next Steps

1. **Connect to real OpenClaw agents** — Update store.ts to call actual endpoints
2. **Add authentication** — Password protect the dashboard
3. **Database persistence** — Swap in-memory store for SQLite
4. **WebSocket realtime** — Replace polling with WebSockets
5. **Custom tool builder** — Visual interface for creating tools

---

**Status**: ✅ ONLINE | **Version**: 1.0.0 | **Last Updated**: 2026-02-15
