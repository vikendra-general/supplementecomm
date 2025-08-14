# BBN Nutrition Troubleshooting Guide

## Common Issues and Solutions

This guide addresses common issues with the BBN Nutrition application, particularly focusing on admin login and database connectivity problems.

## Database Connectivity Issues

### Symptoms
- Server fails to start with MongoDB connection errors
- API requests fail with 500 errors
- Console shows database connection timeouts

### Solutions

1. **Verify MongoDB is running**
   ```bash
   # Check if MongoDB is running
   pgrep mongod
   
   # If not running, start MongoDB
   brew services start mongodb-community
   ```

2. **Run the database troubleshooter script**
   ```bash
   node fix-database.js
   ```
   This script will:
   - Check if MongoDB is running
   - Attempt to start MongoDB if it's not running
   - Test the database connection
   - Provide troubleshooting steps if issues are detected

3. **Check MongoDB URI in config.env**
   - Open `backend/config.env`
   - Verify that `MONGODB_URI` is set correctly (default: `mongodb://localhost:27017/bbn-nutrition`)

4. **Manually connect to MongoDB**
   ```bash
   mongo mongodb://localhost:27017/bbn-nutrition
   ```
   If this fails, there may be an issue with your MongoDB installation.

## Admin Login Issues

### Symptoms
- Unable to log in to the admin panel
- "Invalid credentials" error when using admin login
- Admin features not accessible after login

### Solutions

1. **Run the admin user fix script**
   ```bash
   node fix-admin-user.js
   ```
   This script will:
   - Check if the admin user exists in the database
   - Create the admin user if it doesn't exist
   - Reset the admin password to the default
   - Ensure the user has the admin role

2. **Verify admin login with the test script**
   ```bash
   node verify-admin-login.js
   ```
   This script will:
   - Test admin login with the default credentials
   - Test access to the admin dashboard
   - Provide detailed error information if login fails

3. **Check the server port**
   - Ensure the server is running on port 5001 (check `backend/config.env`)
   - Verify that the login request is being sent to the correct port

4. **Clear browser cookies and cache**
   - Old or corrupted tokens may prevent successful login
   - Try using incognito/private browsing mode

## Server Issues

### Symptoms
- Server crashes or fails to start
- API endpoints return 404 or 500 errors
- Console shows syntax or runtime errors

### Solutions

1. **Check server logs**
   ```bash
   # Start the server with verbose logging
   NODE_ENV=development node backend/server.js
   ```

2. **Verify dependencies are installed**
   ```bash
   cd backend
   npm install
   ```

3. **Check for port conflicts**
   ```bash
   # Check if something is already using port 5001
   lsof -i :5001
   ```

4. **Restart the server**
   ```bash
   # Kill any existing node processes
   pkill node
   
   # Start the server
   node backend/server.js
   ```

## Default Admin Credentials

```
Email: admin@bbn-nutrition.com
Password: Admin123!
```

## Quick Setup

If you're setting up the application for the first time or want to reset everything:

1. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

2. **Fix database connectivity**
   ```bash
   node fix-database.js
   ```

3. **Create/reset admin user**
   ```bash
   node fix-admin-user.js
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm install
   node server.js
   ```

5. **Verify admin login**
   ```bash
   node verify-admin-login.js
   ```

## Still Having Issues?

If you're still experiencing problems after trying these solutions:

1. Check the MongoDB logs for errors:
   ```bash
   cat ~/data/db/mongodb.log
   ```

2. Verify your Node.js version (recommended: v14 or higher):
   ```bash
   node --version
   ```

3. Try completely resetting the database:
   ```bash
   mongo mongodb://localhost:27017/bbn-nutrition --eval "db.dropDatabase()"
   node backend/seed.js
   node fix-admin-user.js
   ```

4. Check for firewall or network issues that might be blocking connections to MongoDB or the API server.