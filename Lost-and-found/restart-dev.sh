#!/bin/bash

echo "🔄 Restarting Lost & Found Development Servers..."

# Kill existing processes
echo "🛑 Stopping existing servers..."
pkill -f "npm run dev"
pkill -f "node server.js"
pkill -f "nodemon"

# Wait a moment
sleep 2

# Start backend
echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🚀 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"