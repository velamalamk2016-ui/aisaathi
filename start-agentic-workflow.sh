#!/bin/bash

# AI Saathi Agentic Workflow Startup Script
# This script starts both the Node.js backend and Python workflow API

echo "🚀 Starting AI Saathi Agentic Workflow System"
echo "=============================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 to continue."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Python dependencies if needed
echo "📦 Installing Python dependencies..."
pip3 install --break-system-packages fastapi uvicorn google-generativeai pydantic python-multipart 2>/dev/null || echo "Dependencies already installed or failed to install"

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Create log directory
mkdir -p logs

echo ""
echo "🚀 Starting services..."
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    pkill -f "uvicorn.*agentic-workflow-api"
    pkill -f "node.*server/index"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start Python FastAPI server in background
echo "🐍 Starting Python Agentic Workflow API on port 8001..."
python3 server/agentic-workflow-api.py > logs/python-api.log 2>&1 &
PYTHON_PID=$!

# Wait a moment for Python server to start
sleep 3

# Start Node.js server in background
echo "🟢 Starting Node.js backend server on port 5000..."
npm run dev > logs/nodejs-server.log 2>&1 &
NODEJS_PID=$!

# Wait a moment for Node.js server to start
sleep 5

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Available endpoints:"
echo "   • Frontend:              http://localhost:5000"
echo "   • Agentic Workflow UI:   http://localhost:5000/agents/agentic-workflow"
echo "   • Python API:           http://localhost:8001"
echo "   • API Documentation:    http://localhost:8001/docs"
echo "   • Health Check:         http://localhost:8001/health"
echo ""
echo "📝 Logs:"
echo "   • Python API logs:      logs/python-api.log"
echo "   • Node.js server logs:  logs/nodejs-server.log"
echo ""
echo "🎯 Testing the workflow system:"
echo "   1. Open http://localhost:5000/agents/agentic-workflow"
echo "   2. Try the 'Complete Lesson Creation' template"
echo "   3. Create your own custom workflow"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Monitor services
while true; do
    # Check if Python server is still running
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "❌ Python API server stopped unexpectedly"
        echo "📄 Last logs from Python API:"
        tail -n 10 logs/python-api.log
        break
    fi
    
    # Check if Node.js server is still running
    if ! kill -0 $NODEJS_PID 2>/dev/null; then
        echo "❌ Node.js server stopped unexpectedly"
        echo "📄 Last logs from Node.js server:"
        tail -n 10 logs/nodejs-server.log
        break
    fi
    
    sleep 5
done

# Cleanup
cleanup