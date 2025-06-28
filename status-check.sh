#!/bin/bash

echo "🔍 Checking Document Collaboration Platform Status..."
echo "=================================================="

# Check if backend is running
echo "📡 Backend Status:"
if curl -s http://localhost:5001/api/auth/login > /dev/null 2>&1; then
    echo "✅ Backend is running on port 5001"
else
    echo "❌ Backend is not responding on port 5001"
fi

# Check if frontend is running
echo "🌐 Frontend Status:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
    echo "🔗 Open your browser and go to: http://localhost:3000"
else
    echo "❌ Frontend is not responding on port 3000"
fi

echo ""
echo "📋 Quick Start Guide:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Register a new account or login"
echo "3. Create your first document"
echo "4. Start collaborating!"
echo ""
echo "⚠️  Note: This is using an in-memory database, so data will be lost on restart."
echo "   For production, set up MongoDB Atlas and update the .env file." 