# MongoDB Setup Guide for BBN Nutrition

## Option 1: MongoDB Atlas (Recommended - Free)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose the free tier (M0 Sandbox)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `bbn-nutrition`

### Step 6: Update Environment Configuration
Update `backend/config.env`:
```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/bbn-nutrition?retryWrites=true&w=majority
```

## Option 2: Local MongoDB Installation

### Windows Installation
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) if prompted
5. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

### macOS Installation (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux Installation (Ubuntu)
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 3: Docker (if you have Docker installed)

### Create docker-compose.yml
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: bbn-nutrition-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: bbn-nutrition
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### Start MongoDB with Docker
```bash
docker-compose up -d
```

## Testing the Connection

After setting up MongoDB, test the connection:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5001
```

## Troubleshooting

### Common Issues:
1. **Connection refused**: MongoDB service not running
2. **Authentication failed**: Wrong username/password
3. **Network access**: IP not whitelisted in Atlas
4. **Connection string**: Incorrect format

### For MongoDB Atlas:
- Make sure your IP is whitelisted
- Check username and password are correct
- Verify the connection string format

### For Local MongoDB:
- Check if MongoDB service is running
- Verify port 27017 is not blocked
- Check MongoDB logs for errors

## Next Steps

Once MongoDB is connected:
1. Start the backend server: `npm run dev`
2. Start the frontend server: `npm run dev`
3. Seed the database: `npm run seed`
4. Access the application at http://localhost:3000 