/**
 * Article Scraping Script
 * Scrapes articles from BeyondChats blog and saves them to database
 * Usage: npm run scrape
 */

require('dotenv').config();
const connectDB = require('../config/database');
const Article = require('../models/Article');
const { scrapeBeyondChatsArticles } = require('../services/scraper');

/**
 * Main function to scrape and save articles
 */
const scrapeAndSave = async () => {
  try {
    console.log('🚀 Starting article scraping process...\n');

    // Connect to database
    await connectDB();

    // Check if articles already exist
    const existingCount = await Article.countDocuments({ isUpdated: false });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing original articles in database`);
      console.log('Do you want to continue? This might create duplicates.');
      console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Scrape articles
    console.log('📡 Scraping 5 oldest articles from BeyondChats blog...\n');
    const articles = await scrapeBeyondChatsArticles(5);

    if (articles.length === 0) {
      console.log('❌ No articles were scraped. Please check the website structure.');
      process.exit(1);
    }

    // Save articles to database
    console.log('\n💾 Saving articles to database...\n');
    
    let savedCount = 0;
    let skippedCount = 0;

    for (const articleData of articles) {
      try {
        // Check if article already exists by URL
        const existing = await Article.findOne({ url: articleData.url });
        
        if (existing) {
          console.log(`  ⏭️  Skipped (already exists): ${articleData.title}`);
          skippedCount++;
          continue;
        }

        // Create new article
        const article = await Article.create(articleData);
        console.log(`  ✅ Saved: ${article.title}`);
        console.log(`     ID: ${article._id}`);
        console.log(`     Words: ${article.metadata.wordCount}`);
        console.log(`     Reading time: ${article.metadata.readingTime} min\n`);
        savedCount++;

      } catch (error) {
        console.error(`  ❌ Error saving article:`, error.message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCRAPING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total articles scraped: ${articles.length}`);
    console.log(`Successfully saved: ${savedCount}`);
    console.log(`Skipped (duplicates): ${skippedCount}`);
    console.log('='.repeat(60));

    // Display saved articles
    const allArticles = await Article.find({ isUpdated: false })
      .select('title url date')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\n📚 Latest articles in database:');
    allArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     ${article.url}`);
    });

    console.log('\n✅ Scraping completed successfully!');
    console.log('💡 Next step: Start the server with "npm run dev"\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
scrapeAndSave();
