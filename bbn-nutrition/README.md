# BBN Nutrition - E-commerce Platform

A comprehensive, full-stack e-commerce platform built with Next.js, Node.js, and MongoDB. This platform provides a complete solution for selling supplements and nutrition products online.

## 🚀 Features

### Core E-commerce Functionality
- ✅ **User Authentication** - Complete signup, login, and password management
- ✅ **Product Management** - Full CRUD operations with categories, variants, and inventory
- ✅ **Shopping Cart** - Persistent cart with quantity controls and price calculations
- ✅ **Order Management** - Complete order lifecycle from creation to delivery
- ✅ **Payment Integration** - Stripe payment processing with webhook support
- ✅ **User Profiles** - Order history, wishlist, address management
- ✅ **Admin Dashboard** - Comprehensive admin panel with analytics

### Advanced Features
- 🔍 **Search & Filtering** - Advanced product search with multiple filters
- ⭐ **Reviews & Ratings** - Product reviews with user authentication
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🔒 **Security** - JWT authentication, input validation, XSS protection
- 📊 **Analytics** - Sales analytics, user statistics, and reporting
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface with smooth animations

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payment**: Stripe integration with webhook support
- **File Upload**: Multer with Cloudinary support
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form with validation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Git

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bbn-nutrition
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

#### Backend Environment (.env)
Create a `config.env` file in the `backend` directory:

```env
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

# Shipping Configuration
FREE_SHIPPING_THRESHOLD=4000
SHIPPING_COST=500
TAX_RATE=0.18
```

#### Frontend Environment (.env.local)
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in config.env
```

### 5. Seed Data (Optional)
```bash
cd backend
npm run seed
```

## 🚀 Running the Application

### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev:full

# Or run them separately:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
bbn-nutrition/
├── backend/                 # Node.js/Express backend
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── uploads/            # File uploads directory
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   └── data/              # Static data
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/role` - Update user role

## 🎨 Key Components

### Frontend Components
- `Header.tsx` - Navigation and user menu
- `ProductCard.tsx` - Product display component
- `CartContext.tsx` - Shopping cart state management
- `AuthContext.tsx` - Authentication state management
- `AdminDashboard.tsx` - Admin analytics dashboard
- `ProfilePage.tsx` - User profile and settings

### Backend Models
- `User.js` - User model with authentication
- `Product.js` - Product model with reviews
- `Order.js` - Order model with status tracking

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- XSS and CSRF protection
- Rate limiting
- Helmet security headers
- MongoDB injection protection

## 💳 Payment Integration

The platform integrates with Stripe for secure payment processing:

1. **Payment Intents** - Server-side payment intent creation
2. **Webhooks** - Real-time payment status updates
3. **Customer Management** - Stripe customer profiles
4. **Multiple Payment Methods** - Cards, digital wallets

## 📊 Admin Features

### Dashboard Analytics
- Total users, products, orders, and revenue
- Recent orders with status tracking
- Top-selling products
- Monthly revenue charts

### Order Management
- View all orders with filtering
- Update order status
- Add tracking numbers
- Order history tracking

### User Management
- View all users
- Update user roles
- User statistics

### Product Management
- Add/edit/delete products
- Inventory management
- Product analytics
- Bulk stock updates

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the code comments for implementation details

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies regularly
- Monitor security vulnerabilities
- Backup database regularly
- Monitor application performance
- Update Stripe webhook endpoints

### Performance Optimization
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Implement lazy loading
- Monitor Core Web Vitals

---

**BBN Nutrition** - Premium supplements for athletes and fitness enthusiasts. Quality ingredients, proven results, and unbeatable performance.
