/**
 * Clear Articles Script
 * Deletes all articles from database for fresh scraping
 */

require('dotenv').config();
const connectDB = require('../config/database');
const Article = require('../models/Article');

const clearArticles = async () => {
  try {
    await connectDB();

    const count = await Article.countDocuments();
    console.log(`\n📊 Found ${count} articles in database`);

    if (count === 0) {
      console.log('✅ Database is already empty\n');
      process.exit(0);
    }

    console.log('🗑️  Deleting all articles...');
    
    const result = await Article.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} articles`);
    console.log('💡 Run "npm run scrape" to get fresh articles\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearArticles();
