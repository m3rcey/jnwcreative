#!/bin/bash

# Mission Control Startup Script
# Usage: ./start.sh [port] [tunnel]

PORT="${1:-3000}"
TUNNEL="${2:-none}"

echo "🚀 Starting Mission Control..."
echo "📍 Local URL: http://localhost:$PORT"

# Check if ngrok is requested for external access
if [ "$TUNNEL" = "ngrok" ]; then
  if ! command -v ngrok &> /dev/null; then
    echo "⚠️  ngrok not found. Install from https://ngrok.com/download"
    echo "   Then run: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
  fi
  
  echo "🌐 Starting ngrok tunnel..."
  ngrok http $PORT &
  NGROK_PID=$!
  sleep 3
  
  # Get ngrok URL
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep https | head -1 | cut -d'"' -f4)
  if [ ! -z "$NGROK_URL" ]; then
    echo "📱 Mobile Access: $NGROK_URL"
    echo "   (Scan QR code at http://localhost:4040)"
  fi
fi

# Start Next.js
cd "$(dirname "$0")"
npm run dev -- -p $PORT

# Cleanup
if [ ! -z "$NGROK_PID" ]; then
  kill $NGROK_PID 2>/dev/null
fi
