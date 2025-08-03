const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('dev'));

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@bbn-nutrition.com',
    role: 'admin',
    emailVerified: true
  },
  {
    id: '2',
    name: 'Test User',
    email: 'testuser@example.com',
    role: 'user',
    emailVerified: true
  }
];

const mockProducts = [
  {
    id: '1',
    name: 'BBN Whey Protein Isolate',
    description: 'Premium whey protein isolate with 25g protein per serving.',
    price: 59.99,
    category: 'protein',
    brand: 'BBN',
    inStock: true,
    stockQuantity: 150,
    images: ['/images/products/whey-protein-1.jpg']
  },
  {
    id: '2',
    name: 'BBN Pre-Workout Elite',
    description: 'Advanced pre-workout formula with creatine and caffeine.',
    price: 44.99,
    category: 'pre-workout',
    brand: 'BBN',
    inStock: true,
    stockQuantity: 75,
    images: ['/images/products/pre-workout-1.jpg']
  }
];

const mockOrders = [
  {
    _id: '1',
    orderNumber: 'ORD-001',
    user: 'Test User',
    total: 104.98,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString(),
    shippingAddress: {
      city: 'New York',
      state: 'NY'
    }
  },
  {
    _id: '2',
    orderNumber: 'ORD-002',
    user: 'Test User',
    total: 44.99,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString(),
    shippingAddress: {
      city: 'New York',
      state: 'NY'
    }
  }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'mock-admin-token') {
    req.user = mockUsers[0]; // Admin user
  } else if (token === 'mock-user-token') {
    req.user = mockUsers[1]; // Regular user
  } else {
    req.user = null;
  }
  next();
};

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BBN Nutrition API is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    environment: 'mock'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@bbn-nutrition.com' && password === 'Admin123!') {
    res.json({
      success: true,
      token: 'mock-admin-token',
      user: mockUsers[0]
    });
  } else if (email === 'testuser@example.com' && password === 'Test123!') {
    res.json({
      success: true,
      token: 'mock-user-token',
      user: mockUsers[1]
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/me', mockAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  res.json({
    success: true,
    user: req.user
  });
});

// Products routes
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: mockProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// Admin routes
app.get('/api/admin/dashboard', mockAuth, (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  res.json({
    success: true,
    data: {
      stats: {
        totalProducts: mockProducts.length,
        totalOrders: mockOrders.length,
        totalUsers: mockUsers.length,
        totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0)
      },
      recentOrders: mockOrders.slice(0, 5),
      topProducts: mockProducts.slice(0, 5),
      monthlyRevenue: [
        { _id: '2024-01', revenue: 1500, orders: 10 },
        { _id: '2024-02', revenue: 2200, orders: 15 }
      ]
    }
  });
});

app.get('/api/admin/orders', mockAuth, (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  res.json({
    success: true,
    data: mockOrders
  });
});

// Orders routes
app.get('/api/orders', mockAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  res.json({
    success: true,
    data: mockOrders
  });
});

// API documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'BBN Nutrition API Documentation (Mock Mode)',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user'
      },
      products: {
        'GET /api/products': 'Get all products',
        'GET /api/products/:id': 'Get single product'
      },
      admin: {
        'GET /api/admin/dashboard': 'Get admin dashboard stats',
        'GET /api/admin/orders': 'Get all orders (admin)'
      },
      orders: {
        'GET /api/orders': 'Get user orders'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Mock Server running on port ${PORT}`);
  console.log(`📊 Environment: Mock Mode (No MongoDB required)`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`\n📋 Test Credentials:`);
  console.log(`   Admin: admin@bbn-nutrition.com / Admin123!`);
  console.log(`   User:  testuser@example.com / Test123!`);
});

module.exports = app; 