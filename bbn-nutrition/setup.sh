#!/bin/bash

# BBN Nutrition E-commerce Platform Setup Script
# This script automates the complete setup process for the BBN Nutrition e-commerce platform

set -e

echo "🚀 BBN Nutrition E-commerce Platform Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check if MongoDB is running
check_mongodb() {
    print_status "Checking MongoDB connection..."
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed locally. You can use MongoDB Atlas (cloud) instead."
        echo "To install MongoDB locally:"
        echo "  macOS: brew install mongodb-community"
        echo "  Ubuntu: sudo apt install mongodb"
        echo "  Or use MongoDB Atlas: https://www.mongodb.com/atlas"
    else
        # Try to connect to MongoDB
        if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
            print_success "MongoDB is running"
        else
            print_warning "MongoDB is installed but not running. Please start MongoDB:"
            echo "  brew services start mongodb-community  # macOS"
            echo "  sudo systemctl start mongod           # Linux"
        fi
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/config.env" ]; then
        cat > backend/config.env << EOF
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bbn-nutrition
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@bbn-nutrition.com
FROM_NAME=BBN Nutrition

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
SESSION_SECRET=your-session-secret-key

# Email Templates
VERIFICATION_EMAIL_TEMPLATE=verification-email
PASSWORD_RESET_TEMPLATE=password-reset
ORDER_CONFIRMATION_TEMPLATE=order-confirmation

# Shipping Configuration
FREE_SHIPPING_THRESHOLD=4000
SHIPPING_COST=500
TAX_RATE=0.18
EOF
        print_success "Backend environment file created"
    else
        print_warning "Backend environment file already exists"
    fi
    
    # Frontend environment
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
EOF
        print_success "Frontend environment file created"
    else
        print_warning "Frontend environment file already exists"
    fi
}

# Create uploads directory
create_uploads_dir() {
    print_status "Creating uploads directory..."
    mkdir -p backend/uploads
    print_success "Uploads directory created"
}

# Seed database (optional)
seed_database() {
    print_status "Would you like to seed the database with sample data? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Seeding database..."
        cd backend
        npm run seed
        cd ..
        print_success "Database seeded with sample data"
    else
        print_warning "Skipping database seeding"
    fi
}

# Test the setup
test_setup() {
    print_status "Testing the setup..."
    
    # Test backend
    print_status "Testing backend server..."
    cd backend
    timeout 10s npm run dev > /dev/null 2>&1 &
    BACKEND_PID=$!
    sleep 5
    
    if curl -s http://localhost:5001/api/health > /dev/null; then
        print_success "Backend server is running"
    else
        print_error "Backend server failed to start"
    fi
    
    kill $BACKEND_PID 2>/dev/null || true
    cd ..
    
    # Test frontend build
    print_status "Testing frontend build..."
    if npm run build > /dev/null 2>&1; then
        print_success "Frontend builds successfully"
    else
        print_error "Frontend build failed"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Configure your environment variables:"
    echo "   - Edit backend/config.env with your API keys"
    echo "   - Edit .env.local with your Stripe publishable key"
    echo ""
    echo "2. Set up your payment gateway:"
    echo "   - Create a Stripe account: https://stripe.com"
    echo "   - Get your API keys and update config.env"
    echo ""
    echo "3. Set up your email service:"
    echo "   - Configure SMTP settings in config.env"
    echo "   - Or use a service like SendGrid or Mailgun"
    echo ""
    echo "4. Set up your image storage:"
    echo "   - Create a Cloudinary account: https://cloudinary.com"
    echo "   - Update Cloudinary settings in config.env"
    echo ""
    echo "5. Start the development servers:"
    echo "   npm run dev:full"
    echo ""
    echo "6. Access your application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5001/api"
    echo "   - API Docs: http://localhost:5001/api/docs"
    echo ""
    echo "7. Create an admin user:"
    echo "   - Register a new user"
    echo "   - Manually update the user role to 'admin' in the database"
    echo ""
    echo "For more information, see the README.md file"
    echo ""
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    # Run all setup steps
    check_nodejs
    check_npm
    check_mongodb
    install_frontend_deps
    install_backend_deps
    setup_environment
    create_uploads_dir
    seed_database
    test_setup
    show_next_steps
    
    print_success "Setup completed successfully!"
}

# Run the setup
main "$@" 