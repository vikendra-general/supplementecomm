#!/bin/bash

echo "🚀 Setting up BBN Nutrition E-commerce Application"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! curl -s http://localhost:27017 > /dev/null 2>&1; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start MongoDB with: mongod"
    echo "   Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$(dirname "$0")"
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5001/api
EOF
    echo "✅ Created .env.local file"
fi

# Seed the database
echo "🌱 Seeding the database..."
cd backend
node seed.js
cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Login Credentials:"
echo "   Admin: admin@bbn-nutrition.com / Admin123!"
echo "   User:  testuser@example.com / Test123!"
echo ""
echo "🚀 To start the application:"
echo "   1. Start the backend: cd backend && npm run dev"
echo "   2. Start the frontend: npm run dev"
echo "   3. Or use the combined command: npm run dev:full"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001/api"
echo "   Admin Panel: http://localhost:3000/admin"
echo ""
echo "📚 API Documentation: http://localhost:5001/api/docs"
echo "" 