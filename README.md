# BeyondChats Article Enhancer 🚀

An AI-powered article improvement pipeline that scrapes blog articles, analyzes top-ranking Google results, and uses AI to enhance content quality, SEO, and readability.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

## ✨ Features

### Phase 1 - CRUD API & Database
- ✅ Automated scraping of BeyondChats blog articles
- ✅ MongoDB database with comprehensive article schema
- ✅ RESTful CRUD API endpoints
- ✅ Input validation and error handling
- ✅ Structured response formatting

### Phase 2 - AI Enhancement
- ✅ Google search integration (free, no API key)
- ✅ DuckDuckGo fallback search
- ✅ Content extraction from top-ranking articles
- ✅ AI-powered article rewriting (Groq API - free)
- ✅ Hugging Face fallback (100% free)
- ✅ Citation management and reference tracking
- ✅ Rate limiting and progress logging
- ✅ Enhancement script with detailed logging

### Phase 3 - React Frontend (Upcoming)
- ⏳ Responsive article display interface
- ⏳ Original vs Enhanced article comparison
- ⏳ Professional UI with Tailwind CSS
- ⏳ Loading states and error handling

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Web Scraping**: Puppeteer + Cheerio
- **Validation**: Joi

### AI & Search
- **LLM**: Groq API (Free tier - 14,400 requests/day)
- **Alternative LLMs**: Hugging Face Inference API, Together AI
- **Search**: Custom Google scraper (100% free, rate-limited)
- **Alternative Search**: SerpAPI (100 free searches/month)

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Security & Performance
- **Security**: Helmet.js, CORS
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan
- **Environment**: dotenv

## 🏗️ Architecture

```mermaid
graph TD
    A[BeyondChats Blog] -->|Scrape| B[Web Scraper]
    B -->|Store| C[(MongoDB)]
    C -->|Fetch| D[Enhancement Script]
    D -->|Search| E[Google Search]
    E -->|Extract URLs| F[Article Scraper]
    F -->|Content| G[AI Service - Groq/HF]
    G -->|Enhanced Article| C
    C -->|API| H[Express Server]
    H -->|REST API| I[React Frontend]
    I -->|Display| J[User Interface]
```

### Data Flow
1. **Scraping Phase**: Puppeteer scrapes 5 oldest articles from BeyondChats blog
2. **Storage Phase**: Articles stored in MongoDB with metadata
3. **Enhancement Phase**: 
   - Script fetches original articles via API
   - Searches Google for top-ranking content
   - Scrapes competitor articles
   - Sends to free LLM API for enhancement
   - Saves enhanced version with references
4. **Display Phase**: React frontend shows original vs enhanced articles

## 📦 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0+ (local) or MongoDB Atlas account (free)
- **npm**: v9.0.0 or higher
- **Git**: Latest version

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/beyondchats-article-enhancer.git
cd beyondchats-article-enhancer
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

## ⚙️ Environment Setup

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your settings:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Choose one option)
MONGODB_URI=mongodb://localhost:27017/beyondchats-articles
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beyondchats

# AI API (Recommended: Groq - Free & Fast)
GROQ_API_KEY=your_groq_api_key_here

# Rate Limiting
REQUESTS_PER_MINUTE=10
SCRAPING_DELAY_MS=2000

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Get Free API Keys

#### MongoDB Atlas (Recommended - 512MB Free)
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster
3. Get connection string
4. Add to `MONGODB_URI`

#### Groq API (Recommended - 14,400 free requests/day)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for free account
3. Generate API key
4. Add to `GROQ_API_KEY`

#### Alternative: Hugging Face (100% Free)
1. Visit [Hugging Face](https://huggingface.co/join)
2. Go to Settings → Access Tokens
3. Create new token
4. Add to `HUGGINGFACE_API_KEY`

## 🏃 Running the Project

### Development Mode

#### 1. Start MongoDB (if local)
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### 2. Start Backend Server
```bash
npm run dev
```
Server runs on `http://localhost:5000`

#### 3. Scrape Initial Articles
```bash
npm run scrape
```

### Step 4: Get Free AI API Key

**Get Groq API key** (recommended - fastest):
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up (free, no credit card)
3. CreatView Enhanced Articles
```bash
# Check enhancement results
npm run check

# View in API
# Visit: http://localhost:5000/api/articles?isUpdated=true
```

#### 6. Start Frontend (Phase 3 - Coming Soon
4. Add to `.env`: `GROQ_API_KEY=your_key_here`

See detailed guide: [GROQ_API_SETUP.md](GROQ_API_SETUP.md)

### Step 5: Enhance Articles (Phase 2)
```bash
npm run enhance
```

This will:
- Search Google for top articles
- Scrape reference content
- Use AI to enhance articles
- Save with references

#### 5. Start Frontend (Phase 3)
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

### Production Mode
```bash
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Get All Articles
```http
GET /api/articles
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "123abc",
      "title": "Article Title",
      "content": "Full article content...",
      "author": "Author Name",
      "date": "2024-01-15T10:30:00.000Z",
      "url": "https://beyondchats.com/blogs/article",
      "isUpdated": false,
      "originalArticleId": null
    }
  ]
}
```

#### 2. Get Single Article
```http
GET /api/articles/:id
```

#### 3. Create Article
```http
POST /api/articles
Content-Type: application/json

{
  "title": "Article Title",
  "content": "Article content...",
  "author": "Author Name",
  "date": "2024-01-15",
  "url": "https://example.com/article"
}
```

#### 4. Update Article
```http
PUT /api/articles/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### 5. Delete Article
```http
DELETE /api/articles/:id
```

### Error Responses
```json
{
  "success": false,
  "error": "Error message description"
}
```

## 🌐 Deployment

### Backend (Railway/Render - Free Tier)

#### Railway
1. Push code to GitHub
2. Visit [Railway](https://railway.app/)
3. "New Project" → "Deploy from GitHub"
4. Add environment variables
5. Deploy

#### Render
1. Visit [Render](https://render.com/)
2. "New" → "Web Service"
3. Connect GitHub repository
4. Configure environment
5. Deploy

### Frontend (Vercel - Free)
```bash
cd frontend
npm run build
vercel deploy
```

### Database (MongoDB Atlas - Free 512MB)
Already configured if using Atlas connection string

## 📁 Project Structure

```
beyondchats-article-enhancer/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection setup
│   ├── models/
│   │   └── Article.js           # Mongoose article schema
│   ├── routes/
│   │   └── articles.js          # CRUD API routes
│   ├── controllers/
│   │   └── articleController.js # Route handlers & business logic
│   ├── services/
│   │   ├── scraper.js          # Web scraping service
│   │   ├── googleSearch.js     # Google search integration
│   │   └── aiService.js        # LLM API integration
│   ├── middleware/
│   │   ├── errorHandler.js     # Global error handling
│   │   └── validation.js       # Input validation
│   ├── scripts/
│   │   ├── scrapeArticles.js   # Initial scraping script
│   │   └── enhanceArticles.js  # AI enhancement script
│   ├── utils/
│   │   ├── logger.js           # Logging utility
│   │   └── rateLimiter.js      # Rate limiting helper
│   └── server.js               # Express app entry point
├── frontend/                    # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔑 Free APIs & Tools Used

| Service | Free Tier | Purpose |
|---------|-----------|---------|
| MongoDB Atlas | 512MB | Database |
| Groq API | 14,400 req/day | LLM Enhancement |
| Hugging Face | Unlimited | Alternative LLM |
| Custom Scraper | Unlimited | Google Search |
| SerpAPI | 100 searches/month | Alternative Search |
| Vercel | Unlimited | Frontend Hosting |
| Railway/Render | 500hrs/month | Backend Hosting |

## 📝 Development Journey

This project demonstrates:
- ✅ RESTful API design principles
- ✅ Database schema design and relationships
- ✅ Web scraping with rate limiting
- ✅ Integration of free AI APIs
- ✅ Error handling and validation
- ✅ Modular code architecture
- ✅ Environment-based configuration
- ✅ Professional documentation

## 🤝 Contributing

This is a learning project. Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

**Deepak**

## 🙏 Acknowledgments

- BeyondChats for the blog content
- Free API providers (Groq, Hugging Face, MongoDB)
- Open source community

---

**Note**: This project uses only free-tier APIs and services. No credit card required for development!
