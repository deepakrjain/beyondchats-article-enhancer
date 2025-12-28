# Setup Instructions for BeyondChats Article Enhancer

## Quick Start Guide

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages:
- express (web framework)
- mongoose (MongoDB ODM)
- puppeteer (web scraping)
- cheerio (HTML parsing)
- joi (validation)
- dotenv (environment variables)
- cors, helmet, morgan (security & logging)
- express-rate-limit (rate limiting)

### Step 2: Setup MongoDB

You have two options:

#### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**:
   - Download from: https://www.mongodb.com/try/download/community
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB Compass (GUI tool)

2. **Start MongoDB Service**:
   ```powershell
   net start MongoDB
   ```

3. **Verify MongoDB is running**:
   ```powershell
   mongosh
   ```
   You should see a connection message. Type `exit` to quit.

4. **.env file is already configured** for localhost:
   ```
   MONGODB_URI=mongodb://localhost:27017/beyondchats-articles
   ```

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. **Create Account**:
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card needed)

2. **Create Cluster**:
   - Choose M0 Sandbox (FREE)
   - Select a region close to you
   - Click "Create Cluster"

3. **Setup Database Access**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username and password
   - Select "Read and write to any database"

4. **Setup Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update .env file**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beyondchats
   ```

### Step 3: Test the Server

Start the development server:

```powershell
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost (or your cluster)
📊 Database: beyondchats-articles
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000
💚 Health check: http://localhost:5000/health
```

### Step 4: Test API Endpoints

Open a new PowerShell window and test the health endpoint:

```powershell
curl http://localhost:5000/health
```

Or open your browser and visit: http://localhost:5000

You should see a JSON response with API information.

### Step 5: Scrape Articles

In a new PowerShell window (keep the server running):

```powershell
npm run scrape
```

This will:
1. Launch Puppeteer browser
2. Navigate to https://beyondchats.com/blogs/
3. Extract 5 oldest articles
4. Save them to MongoDB
5. Display a summary

**Expected output:**
```
🚀 Starting article scraping process...
✅ MongoDB Connected: localhost
📡 Scraping 5 oldest articles from BeyondChats blog...
🌐 Launching browser...
📄 Navigating to BeyondChats blog...
  1. Scraping: [article URL]
  ✅ Successfully scraped: [article title]
...
✅ Successfully scraped 5 articles
💾 Saving articles to database...
📊 SCRAPING SUMMARY
Total articles scraped: 5
Successfully saved: 5
```

### Step 6: Verify Data in MongoDB

#### Using MongoDB Compass (GUI):
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Find database `beyondchats-articles`
4. Click on `articles` collection
5. You should see 5 articles

#### Using API:
```powershell
curl http://localhost:5000/api/articles
```

Or open browser: http://localhost:5000/api/articles

### Step 7: Test CRUD Operations

#### Get all articles:
```powershell
curl http://localhost:5000/api/articles
```

#### Get single article (replace with actual ID):
```powershell
curl http://localhost:5000/api/articles/[article-id]
```

#### Create article:
```powershell
curl -X POST http://localhost:5000/api/articles `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Test Article\",\"content\":\"Test content\",\"url\":\"https://example.com/test\"}'
```

#### Update article:
```powershell
curl -X PUT http://localhost:5000/api/articles/[article-id] `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Updated Title\"}'
```

#### Delete article:
```powershell
curl -X DELETE http://localhost:5000/api/articles/[article-id]
```

## Troubleshooting

### MongoDB Connection Error
**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Make sure MongoDB service is running:
   ```powershell
   net start MongoDB
   ```

2. Check MongoDB status:
   ```powershell
   sc query MongoDB
   ```

3. If using Atlas, check:
   - Network access allows your IP
   - Connection string is correct
   - Username/password are correct

### Puppeteer Installation Issues
**Error**: `Could not find Chrome`

**Solution**:
```powershell
npm install puppeteer --force
```

Or set environment variable:
```powershell
$env:PUPPETEER_SKIP_DOWNLOAD="true"
npm install
```

### Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID [PID] /F
```

Or change PORT in .env file:
```
PORT=5001
```

### Scraping Fails
**Issue**: No articles scraped or errors

**Solutions**:
1. Check internet connection
2. Website structure may have changed - inspect the HTML
3. Try with increased timeout in scraper.js
4. Check console for specific error messages

## Next Steps

✅ **Phase 1 Complete**: Backend API and scraping is working!

**What's next**:
1. Get a free AI API key (Groq recommended)
2. Implement Phase 2 - Article enhancement
3. Build Phase 3 - React frontend

## Useful Commands

```powershell
# Development server with auto-reload
npm run dev

# Start server (production)
npm start

# Scrape articles
npm run scrape

# Enhance articles (Phase 2 - coming next)
npm run enhance

# Check MongoDB service
sc query MongoDB

# Start MongoDB
net start MongoDB

# Stop MongoDB
net stop MongoDB

# View MongoDB logs
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 20
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 5000 | No |
| NODE_ENV | Environment | development | No |
| MONGODB_URI | MongoDB connection string | localhost | Yes |
| GROQ_API_KEY | Groq AI API key | - | Phase 2 |
| REQUESTS_PER_MINUTE | Rate limit | 10 | No |
| SCRAPING_DELAY_MS | Delay between scrapes | 2000 | No |
| FRONTEND_URL | CORS origin | localhost:3000 | No |

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |
| GET | `/api/articles` | Get all articles |
| GET | `/api/articles/:id` | Get single article |
| POST | `/api/articles` | Create article |
| PUT | `/api/articles/:id` | Update article |
| DELETE | `/api/articles/:id` | Delete article |
| GET | `/api/articles/:id/comparison` | Compare original vs enhanced |

## Testing with Postman/Thunder Client

1. **Install Thunder Client** (VS Code extension):
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search "Thunder Client"
   - Install

2. **Import these requests**:
   - GET http://localhost:5000/api/articles
   - GET http://localhost:5000/api/articles/[id]
   - POST http://localhost:5000/api/articles (with JSON body)

3. **Test validation**:
   - Try creating article without required fields
   - Try invalid MongoDB ObjectId
   - Check error messages

## Success Checklist

- [ ] MongoDB installed and running
- [ ] npm install completed successfully
- [ ] Server starts without errors
- [ ] Health check returns 200 OK
- [ ] Scraper successfully extracts 5 articles
- [ ] Articles saved to database
- [ ] Can view articles via API
- [ ] CRUD operations work correctly

Once all checkboxes are complete, you're ready for Phase 2!
