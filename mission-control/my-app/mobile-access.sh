#!/bin/bash

# Quick mobile access script for Mission Control
# Usage: ./mobile-access.sh [method]
# Methods: ngrok (requires authtoken), cloudflare (free, no account), local

METHOD="${1:-cloudflare}"
PORT="${2:-3456}"

echo "🚀 Mission Control Mobile Access Setup"
echo "======================================"

# Check if server is running
if ! curl -s http://localhost:$PORT/api/stats > /dev/null; then
    echo "⚠️  Mission Control not running on port $PORT"
    echo "   Starting server..."
    cd "$(dirname "$0")"
    npm run dev -- -p $PORT -H 0.0.0.0 > server.log 2>&1 &
    sleep 5
fi

echo "✅ Server running at http://localhost:$PORT"
echo ""

if [ "$METHOD" = "ngrok" ]; then
    if [ -z "$NGROK_AUTHTOKEN" ]; then
        echo "⚠️  ngrok requires an authtoken"
        echo "   Get one free at: https://dashboard.ngrok.com/get-started/your-authtoken"
        echo "   Then run: export NGROK_AUTHTOKEN=your_token"
        exit 1
    fi
    
    echo "🌐 Starting ngrok tunnel..."
    ~/workspace/ngrok config add-authtoken "$NGROK_AUTHTOKEN" 2>/dev/null || true
    ~/workspace/ngrok http $PORT &
    sleep 3
    
    echo ""
    echo "📱 Your mobile URL will appear above ^"
    echo "   (Look for the https://xxxx.ngrok-free.app link)"
    
elif [ "$METHOD" = "cloudflare" ]; then
    echo "🌐 Setting up Cloudflare Tunnel (free, no account needed)..."
    
    # Check if cloudflared exists
    if ! command -v cloudflared &> /dev/null; then
        echo "📥 Installing cloudflared..."
        cd /tmp
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        dpkg -x cloudflared.deb /tmp/cf
        mkdir -p ~/bin
        cp /tmp/cf/usr/bin/cloudflared ~/bin/ 2>/dev/null || true
        export PATH="$HOME/bin:$PATH"
    fi
    
    echo ""
    echo "🌐 Starting tunnel..."
    echo "   Your mobile URL will appear below:"
    echo "   ──────────────────────────────────"
    ~/bin/cloudflared tunnel --url http://localhost:$PORT 2>&1 | grep -E "(https://|Your quick|Tunnel|trycloudflare)" || ~/bin/cloudflared tunnel --url http://localhost:$PORT
    
elif [ "$METHOD" = "local" ]; then
    IP=$(hostname -I | awk '{print $1}')
    echo "📱 Access from same WiFi network:"
    echo "   http://$IP:$PORT"
    echo ""
    echo "⚠️  Only works when phone and computer are on the same network"
fi
