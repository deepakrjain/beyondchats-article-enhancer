# Get Free Groq API Key (Recommended - Fast & Reliable)

## Why Groq?
- ✅ **14,400 free requests per day** (more than enough)
- ✅ **Extremely fast** - responses in 1-2 seconds
- ✅ **No credit card required**
- ✅ **Best models**: Llama 3.3 70B, Mixtral 8x7B
- ✅ **Easy setup** - 2 minutes

---

## Step-by-Step Setup

### 1. Create Groq Account

1. **Visit**: https://console.groq.com/
2. Click **"Sign In"** (top right)
3. **Sign up** with:
   - Email address
   - OR Google account
   - OR GitHub account
4. Verify your email if prompted

### 2. Generate API Key

1. After login, you'll be on the **Dashboard**
2. Click **"API Keys"** in the left sidebar
3. Click **"Create API Key"** button
4. **Name it**: `BeyondChats Article Enhancer`
5. Click **"Create"**
6. **⚠️ IMPORTANT**: Copy the API key immediately!
   - It looks like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again
7. Save it temporarily in a text file

### 3. Add to Your Project

1. Open your `.env` file in VS Code
2. Find the line: `GROQ_API_KEY=`
3. Paste your API key after the `=`:
   ```env
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Save the file** (Ctrl+S)

### 4. Test the Setup

```powershell
# Make sure server is NOT running (if it is, stop it with Ctrl+C)

# Run the enhancement script
npm run enhance
```

**What to expect:**
```
🚀 Starting article enhancement process...
✅ MongoDB Connected
📚 Fetching original articles...
✅ Found 5 articles to enhance

📝 Article 1/5: Will AI Understand the Complexities of Patient Care?
🔍 Step 1: Searching for top-ranking articles...
  ✅ Found 2 reference articles
📄 Step 2: Scraping reference articles...
  ✅ Scraped successfully
🤖 Step 3: Enhancing article with AI...
  🤖 Calling Groq API for enhancement...
  ✅ Article enhanced successfully
💾 Step 4: Saving enhanced article...
  ✅ Enhanced article saved!
```

---

## Troubleshooting

### ❌ Error: "GROQ_API_KEY not found"

**Problem**: API key not in .env file

**Solution**:
1. Make sure `.env` file is saved
2. Check for typos: `GROQ_API_KEY` (not `GROQ_KEY`)
3. No spaces around the `=`
4. API key should start with `gsk_`

### ❌ Error: "Invalid API Key"

**Problem**: API key is incorrect

**Solution**:
1. Go back to Groq Console
2. Delete old key
3. Create new API key
4. Copy and paste carefully into `.env`

### ❌ Error: "Rate limit exceeded"

**Problem**: Too many requests

**Solution**:
- Free tier: 14,400 requests per day
- Wait 24 hours for reset
- Or create new account (not recommended)

### ⚠️ Groq API is down

**Fallback to Hugging Face**:
1. Visit: https://huggingface.co/settings/tokens
2. Create access token
3. Add to `.env`: `HUGGINGFACE_API_KEY=hf_xxxx`
4. The script will automatically use HF if Groq fails

---

## Groq API Limits (Free Tier)

| Feature | Free Tier |
|---------|-----------|
| Requests/Day | 14,400 |
| Requests/Minute | 30 |
| Tokens/Minute | 30,000 |
| Models | All models |
| Cost | $0 |

**For this project**: You'll use ~5-10 requests total, well within limits!

---

## Alternative: Hugging Face (Backup Option)

If Groq doesn't work, use Hugging Face:

### 1. Create Account
- Visit: https://huggingface.co/join
- Sign up (free)

### 2. Get Token
- Go to: https://huggingface.co/settings/tokens
- Click "New token"
- Name: `BeyondChats`
- Type: Read
- Create and copy token

### 3. Add to .env
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: HuggingFace is slower (30-60 seconds per article) but 100% free and unlimited!

---

## Testing Your API Key

Create a test file to verify:

```powershell
# Create test script
echo @"
require('dotenv').config();
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Found ✅' : 'Missing ❌');
"@ | Out-File -Encoding UTF8 test-env.js

# Run test
node test-env.js

# Clean up
Remove-Item test-env.js
```

Should output: `GROQ_API_KEY: Found ✅`

---

## Next Steps

Once API key is added:

1. ✅ **Test enhancement**: `npm run enhance`
2. ✅ **Check results**: Visit http://localhost:5000/api/articles?isUpdated=true
3. ✅ **Compare articles**: Visit http://localhost:5000/api/articles/[id]/comparison
4. ✅ **Commit changes**: Commit Phase 2 completion

---

## Important Notes

🔒 **Security**:
- Never commit `.env` file to GitHub
- `.gitignore` already excludes it
- API key is personal - don't share

⚡ **Performance**:
- Groq is VERY fast (1-2 seconds)
- HuggingFace is slower (30-60 seconds)
- Script includes rate limiting to be respectful

💰 **Cost**:
- Both APIs are 100% FREE
- No credit card needed
- No hidden charges

---

## Ready to Enhance!

Once you've added your API key:

```powershell
npm run enhance
```

This will:
1. Find your 5 original articles
2. Search Google for top-ranking related content
3. Scrape those articles
4. Use AI to rewrite your articles
5. Save enhanced versions with references

**Let's make those articles amazing!** 🚀
