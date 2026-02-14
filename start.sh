#!/bin/bash

echo "🦞 Starting OpenClaw Admin System..."

# Start backend
cd backend
echo "📦 Starting backend on port 7749..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
echo "🎨 Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ OpenClaw Admin System is running!"
echo ""
echo "📊 Dashboard: http://localhost:5173"
echo "🔌 Backend API: http://localhost:7749"
echo "🔑 Auth Token: openclaw-admin-2026"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
