# Quick Setup Guide - BBN Nutrition

## 🚀 Get Your App Running in 5 Minutes

### Step 1: Set up MongoDB Atlas (Free Cloud Database)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Create Free Account**: Click "Try Free" and sign up
3. **Create Database**: 
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select any cloud provider (AWS/Google Cloud/Azure)
   - Choose a region close to you
   - Click "Create"

4. **Set Up Database Access**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username: `bbn-admin`
   - Create password: `bbn-password-123` (or your own)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

5. **Set Up Network Access**:
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

6. **Get Connection String**:
   - Go to "Database" in left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `bbn-nutrition`

### Step 2: Update Backend Configuration

Edit `backend/config.env` and update the MongoDB URI:
```env
MONGODB_URI=mongodb+srv://bbn-admin:your-password@cluster0.xxxxx.mongodb.net/bbn-nutrition?retryWrites=true&w=majority
```

### Step 3: Start the Application

```powershell
# Start both servers
npm run dev:full

# Or start them separately:
# Terminal 1: cd backend && npm run dev
# Terminal 2: npm run dev
```

### Step 4: Seed the Database

```powershell
cd backend
npm run seed
```

### Step 5: Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **API Docs**: http://localhost:5001/api/docs

## 🧪 Test Your Setup

1. Open http://localhost:3000 in your browser
2. Open browser console (F12)
3. Run this test script:
```javascript
// Copy and paste this into browser console
fetch('http://localhost:5001/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend is running:', data);
  })
  .catch(error => {
    console.log('❌ Backend not accessible:', error);
  });
```

## 🔧 Troubleshooting

### Backend won't start?
- Check MongoDB connection string in `backend/config.env`
- Make sure MongoDB Atlas IP whitelist includes your IP
- Verify username/password are correct

### Frontend won't start?
- Check if `.env.local` file exists
- Verify all dependencies are installed: `npm install`

### Database connection failed?
- Check MongoDB Atlas connection string
- Verify network access is set to "Allow Access from Anywhere"
- Check if database user has correct permissions

## 📝 Next Steps After Setup

1. **Test User Registration**: Go to http://localhost:3000/login and create an account
2. **Browse Products**: Visit the shop page and add items to cart
3. **Test Cart**: Add/remove items and test quantity changes
4. **Test Checkout**: Complete a test order
5. **Admin Dashboard**: Create an admin user and explore the admin panel

## 🎯 Success Indicators

✅ Backend shows: "Connected to MongoDB" and "Server running on port 5001"
✅ Frontend loads at http://localhost:3000
✅ You can register/login users
✅ You can add products to cart
✅ Database seeding works (products appear in shop)

## 🆘 Need Help?

- Check the detailed `MONGODB_SETUP.md` for more options
- Run the test script in browser console
- Check server logs for error messages
- Verify all environment variables are set correctly 