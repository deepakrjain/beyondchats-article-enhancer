# MongoDB Atlas Setup Guide (Easiest & Free)

## Why MongoDB Atlas?
✅ **No installation needed** - cloud-based  
✅ **512MB free forever** - no credit card required  
✅ **Works instantly** - just get connection string  
✅ **Perfect for this project** - already integrated  

---

## Step-by-Step Setup (5 minutes)

### 1. Create Free MongoDB Atlas Account

1. **Visit**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with:
   - Email address
   - OR Google account
   - OR GitHub account
3. **Complete verification** (check your email)

### 2. Create Free Cluster

1. After login, you'll see "**Create a deployment**"
2. Choose: **M0 FREE** (should be pre-selected)
   - Storage: 512 MB
   - Cost: FREE Forever
3. **Cloud Provider**: Choose any (AWS, Google Cloud, Azure - doesn't matter)
4. **Region**: Choose closest to your location (for speed)
   - Example: `ap-south-1` (Mumbai) if you're in India
   - Example: `us-east-1` (Virginia) if you're in USA
5. **Cluster Name**: Leave default or name it `beyondchats-cluster`
6. Click **"Create Deployment"** button
7. ⏳ Wait 1-3 minutes for cluster creation

### 3. Create Database User

You'll see a security quickstart screen:

1. **Username**: Enter a username (example: `deepak` or `admin`)
2. **Password**: Click "**Autogenerate Secure Password**" 
   - **⚠️ IMPORTANT**: Copy this password! Save it in a text file temporarily
   - Example: `xK9mP2vL8qN3wR5t`
3. Click **"Create User"**

### 4. Setup Network Access

1. **Add IP Address**: You'll see this option
2. Click **"Add My Current IP Address"** (recommended for security)
   - OR click **"Allow Access from Anywhere"** (easier, but less secure)
   - This adds `0.0.0.0/0` - allows access from any IP
3. Click **"Finish and Close"**

### 5. Get Connection String

1. Click **"Database"** in left sidebar (if not already there)
2. You'll see your cluster (named `Cluster0` or your custom name)
3. Click **"Connect"** button
4. Choose **"Connect your application"**
5. **Driver**: Select **Node.js** and version **5.5 or later**
6. **Copy the connection string** - looks like:
   ```
   mongodb+srv://deepak:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **⚠️ IMPORTANT**: Replace `<password>` with your actual password from Step 3

**Example final connection string:**
```
mongodb+srv://deepak:xK9mP2vL8qN3wR5t@cluster0.abc123.mongodb.net/beyondchats?retryWrites=true&w=majority
```

**Note**: Add `/beyondchats` before the `?` to specify database name.

---

## Update Your Project

### Update .env File

Open your `.env` file and update the `MONGODB_URI`:

```env
# Replace this line
MONGODB_URI=mongodb://localhost:27017/beyondchats-articles

# With your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/beyondchats?retryWrites=true&w=majority
```

**Full .env example:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://deepak:xK9mP2vL8qN3wR5t@cluster0.abc123.mongodb.net/beyondchats?retryWrites=true&w=majority

# AI API Configuration (will add later)
GROQ_API_KEY=

# Rate Limiting
REQUESTS_PER_MINUTE=10
SCRAPING_DELAY_MS=2000

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

---

## Test Your Setup

### 1. Install Dependencies (if not done yet)

```powershell
npm install
```

Wait for installation to complete (2-3 minutes).

### 2. Start the Server

```powershell
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: beyondchats
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000
💚 Health check: http://localhost:5000/health
```

If you see ✅ **MongoDB Connected** - SUCCESS! 🎉

### 3. Test Health Endpoint

Open browser and visit: http://localhost:5000/health

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-28T..."
}
```

### 4. Test API Root

Visit: http://localhost:5000

You should see API documentation with all endpoints listed.

### 5. Scrape Articles

Open a **NEW PowerShell window** (keep server running in the first one):

```powershell
npm run scrape
```

**Expected process:**
```
🚀 Starting article scraping process...
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📡 Scraping 5 oldest articles from BeyondChats blog...
🌐 Launching browser...
📄 Navigating to BeyondChats blog...
🔍 Finding articles...
✅ Found X articles using selector: ...
📝 Processing 5 articles...
  1. Scraping: https://beyondchats.com/blogs/article-1
  ✅ Successfully scraped: [Article Title]
  ...
💾 Saving articles to database...
  ✅ Saved: [Article 1 Title]
     ID: 676f...
     Words: 1234
     Reading time: 6 min
...
📊 SCRAPING SUMMARY
Total articles scraped: 5
Successfully saved: 5
Skipped (duplicates): 0
```

### 6. Verify Data in Atlas

1. Go back to **MongoDB Atlas website**
2. Click **"Database"** → **"Browse Collections"**
3. You should see:
   - Database: `beyondchats`
   - Collection: `articles`
   - Documents: 5 articles
4. Click on `articles` to view the data

### 7. Test CRUD API

**Get all articles:**
```powershell
curl http://localhost:5000/api/articles
```

Or open in browser: http://localhost:5000/api/articles

You should see JSON with 5 articles!

---

## Troubleshooting

### ❌ Error: "MongoServerError: bad auth"

**Problem**: Wrong username or password

**Solution**:
1. Go to Atlas → Database Access
2. Click "Edit" on your user
3. Reset password (click "Edit Password")
4. Update `.env` with new password

### ❌ Error: "MongooseServerSelectionError: connection timeout"

**Problem**: IP not whitelisted

**Solution**:
1. Go to Atlas → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allows all IPs)
4. Or click "Add Current IP Address"

### ❌ Error: "getaddrinfo ENOTFOUND"

**Problem**: Connection string incorrect

**Solution**:
1. Check for typos in `.env`
2. Make sure you replaced `<password>`
3. Ensure `/beyondchats` is added before `?`
4. No extra spaces in connection string

### ⚠️ Puppeteer taking too long

**Solution**:
- First run downloads Chromium (~170MB)
- Wait patiently (3-5 minutes)
- Check internet connection

---

## Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created
- [ ] Database user created with password
- [ ] Network access configured
- [ ] Connection string copied and updated in `.env`
- [ ] `npm install` completed
- [ ] Server starts with "✅ MongoDB Connected"
- [ ] Health endpoint returns 200 OK
- [ ] Scraper successfully runs and saves 5 articles
- [ ] Can view articles at http://localhost:5000/api/articles
- [ ] Articles visible in Atlas dashboard

---

## Quick Reference

### MongoDB Atlas URLs
- Dashboard: https://cloud.mongodb.com/
- Database: Click "Database" in left sidebar
- Browse Collections: Click "Browse Collections" button
- Network Access: Click "Network Access" in left sidebar
- Database Access: Click "Database Access" in left sidebar

### Connection String Format
```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```

### Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/beyondchats?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
SCRAPING_DELAY_MS=2000
FRONTEND_URL=http://localhost:3000
```

---

## What's Next?

Once all checklist items are complete:

✅ **Phase 1 is fully functional!**

**Next commit message:**
```
test: Verify Phase 1 - MongoDB Atlas integration working

- Connected to MongoDB Atlas cloud database
- Successfully scraped and stored 5 articles
- All CRUD endpoints tested and working
- Database visible in Atlas dashboard
```

Then we'll move to **Phase 2: AI Enhancement** 🚀

---

## Tips

💡 **Keep your password safe**: Save it in a password manager

💡 **Free tier limits**: 
- 512MB storage (enough for ~50,000 articles)
- Shared RAM
- No backups (upgrade for backups)

💡 **View data easily**: Use MongoDB Compass (free desktop app)
- Download: https://www.mongodb.com/try/download/compass
- Connect with same connection string

💡 **Multiple environments**: Create different databases for dev/prod
- Dev: `mongodb+srv://...@cluster.mongodb.net/beyondchats-dev`
- Prod: `mongodb+srv://...@cluster.mongodb.net/beyondchats-prod`

---

Need help? Common issues and solutions are in the Troubleshooting section above! 🎯
