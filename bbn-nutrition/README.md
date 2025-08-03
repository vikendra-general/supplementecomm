# BBN Nutrition E-commerce Platform

A modern, full-stack e-commerce platform built for supplement stores with a beautiful green and black theme.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with green and black theme
- **Admin Dashboard**: Complete admin panel for managing products, orders, and users
- **User Authentication**: Secure login/register system with JWT
- **Product Management**: Add, edit, delete products with images
- **Order Management**: Track orders, update status, manage inventory
- **Payment Integration**: Stripe payment processing
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live order tracking and status updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Stripe** - Payments

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)
- Git

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bbn-nutrition
```

### 2. Run Setup Script

**For Windows:**
```powershell
.\setup-mongodb.ps1
```

**For Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Start the Application

**Option 1: Start both servers together**
```bash
npm run dev:full
```

**Option 2: Start servers separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:5001/api/docs

## 👤 Default Login Credentials

After running the setup script, you'll have these accounts:

### Admin Account
- **Email**: admin@bbn-nutrition.com
- **Password**: Admin123!

### Test User Account
- **Email**: testuser@example.com
- **Password**: Test123!

## 🎨 Theme Customization

The application uses a green and black theme perfect for supplement stores. You can customize the colors in:

```css
/* src/app/globals.css */
:root {
  --primary-green: #10b981;
  --primary-green-dark: #059669;
  --black: #000000;
  /* ... more colors */
}
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Create `backend/config.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bbn-nutrition
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB
mongod
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/config.env`

**Option 3: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service or check connection string

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::5001
```
**Solution**: Change port in `backend/config.env` or kill existing process

**3. Module Not Found**
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` in both root and backend directories

**4. Admin Access Denied**
```
You don't have permission to access the admin dashboard
```
**Solution**: Use the admin credentials provided above or check user role in database

**5. API Connection Error**
```
Network error - please check your connection
```
**Solution**: Ensure backend server is running on port 5001

### Database Reset

To reset the database with fresh data:
```bash
cd backend
node seed.js
```

### Clear Cache

If you're experiencing issues with cached data:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📁 Project Structure

```
bbn-nutrition/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout process
│   │   ├── login/          # Authentication
│   │   ├── product/        # Product pages
│   │   └── shop/           # Product catalog
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── backend/
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── uploads/            # File uploads
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- XSS protection
- SQL injection protection

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
# Deploy to Railway or Heroku
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for errors
3. Ensure all dependencies are installed
4. Verify MongoDB is running
5. Check environment variables are set correctly

## 🎯 Roadmap

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced inventory management
- [ ] Customer reviews system
- [ ] Discount codes
- [ ] Shipping calculator
- [ ] Tax calculation

---

**Built with ❤️ for supplement stores**
