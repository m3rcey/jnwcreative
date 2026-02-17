# 🚀 Mission Control

A centralized productivity hub for managing sub-agents, custom tools, approval queues, and workflow automation.

## Features

- **📊 Dashboard** — Real-time system overview with activity feed
- **🤖 Agent Management** — Spawn, monitor, and control sub-agents
- **🛠️ Custom Tools** — Build and manage reusable automation tools
- **✅ Approvals Queue** — Review and approve/reject pending actions
- **⚡ Workflow Automation** — Create triggered multi-step workflows
- **📱 Mobile-First** — Fully responsive, works great on phones

## Quick Start

```bash
# Install dependencies (already done)
npm install

# Start locally
npm run dev

# Or use the startup script with ngrok tunnel for mobile access
./start.sh 3000 ngrok
```

## Mobile Access

### Option 1: ngrok (Recommended)
```bash
# 1. Install ngrok: https://ngrok.com/download
# 2. Add your authtoken: ngrok config add-authtoken YOUR_TOKEN

# 3. Start with tunnel
./start.sh 3000 ngrok

# 4. Access the https URL from your phone anywhere
```

### Option 2: Cloudflare Tunnel (Free, Permanent URL)
```bash
# 1. Install cloudflared
# 2. Run: cloudflared tunnel --url http://localhost:3000
```

### Option 3: Local Network
```bash
# Start with host binding
npm run dev -- -H 0.0.0.0 -p 3000

# Access via your computer's IP: http://YOUR_IP:3000
```

## Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **State**: In-memory store (easily swappable for SQLite/Postgres)
- **API**: RESTful endpoints under `/api/*`
- **Realtime**: 5-second polling (WebSocket upgrade ready)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/agents` | GET/POST | List/create agents |
| `/api/tools` | GET/POST | List/create tools |
| `/api/approvals` | GET/POST | List/update approvals |
| `/api/workflows` | GET/POST | List/create workflows |

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Dashboard
│   ├── components/
│   │   └── MissionControl.tsx  # Main UI
│   ├── lib/
│   │   ├── store.ts       # Data store
│   │   └── utils.ts       # Utilities
│   └── types/
│       └── index.ts       # TypeScript types
├── start.sh               # Startup script with tunneling
└── README.md
```

## Adding a New Tool

1. Define tool interface in `src/types/index.ts`
2. Add to store in `src/lib/store.ts`
3. Create UI in `src/components/MissionControl.tsx`
4. Add API endpoint if needed

## Environment Variables

```bash
# Optional: For external database
DATABASE_URL="file:./mission-control.db"

# Optional: For authentication
AUTH_SECRET="your-secret-key"
```

## License

MIT
