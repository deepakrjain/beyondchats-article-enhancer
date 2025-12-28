/**
 * Article Enhancement Script
 * Main script for Phase 2: AI-powered article enhancement
 * 
 * Process:
 * 1. Fetch original articles from API
 * 2. Search Google for top-ranking articles
 * 3. Scrape content from top results
 * 4. Use AI to enhance original article
 * 5. Save enhanced version with references
 */

require('dotenv').config();
const axios = require('axios');
const connectDB = require('../config/database');
const Article = require('../models/Article');
const { search } = require('../services/googleSearch');
const { scrapeArticle } = require('../services/scraper');
const { enhanceArticle } = require('../services/aiService');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const DELAY_BETWEEN_ARTICLES = parseInt(process.env.SCRAPING_DELAY_MS) || 2000;

/**
 * Delay helper function
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main enhancement process
 */
const enhanceArticles = async () => {
  try {
    console.log('🚀 Starting article enhancement process...\n');
    console.log('='.repeat(70));

    // Connect to database
    await connectDB();

    // Fetch original articles (not yet enhanced)
    console.log('\n📚 Fetching original articles...');
    const articles = await Article.find({ isUpdated: false }).limit(5);

    if (articles.length === 0) {
      console.log('⚠️  No original articles found to enhance.');
      console.log('💡 Run "npm run scrape" first to get articles.\n');
      process.exit(0);
    }

    console.log(`✅ Found ${articles.length} articles to enhance\n`);

    let successCount = 0;
    let failCount = 0;

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      console.log('='.repeat(70));
      console.log(`\n📝 Article ${i + 1}/${articles.length}: ${article.title}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Words: ${article.metadata?.wordCount || 0}\n`);

      try {
        // Step 1: Search Google for similar articles
        console.log('🔍 Step 1: Searching for top-ranking articles...');
        const searchResults = await search(article.title, 2);

        if (searchResults.length === 0) {
          console.log('  ⚠️  No search results found, proceeding without references');
        } else {
          console.log(`  ✅ Found ${searchResults.length} reference articles`);
          searchResults.forEach((result, idx) => {
            console.log(`     ${idx + 1}. ${result.title}`);
            console.log(`        ${result.url}`);
          });
        }

        await delay(2000); // Rate limiting

        // Step 2: Scrape reference articles
        console.log('\n📄 Step 2: Scraping reference articles...');
        const referenceArticles = [];

        for (const result of searchResults) {
          try {
            console.log(`  Scraping: ${result.url}`);
            const scrapedContent = await scrapeArticle(result.url);
            
            referenceArticles.push({
              url: result.url,
              title: result.title,
              content: scrapedContent.content
            });
            
            console.log(`  ✅ Scraped successfully`);
            await delay(2000); // Rate limiting
          } catch (error) {
            console.log(`  ⚠️  Failed to scrape: ${error.message}`);
          }
        }

        console.log(`  📊 Successfully scraped ${referenceArticles.length} reference articles`);

        // Step 3: Enhance with AI
        console.log('\n🤖 Step 3: Enhancing article with AI...');
        const enhancedContent = await enhanceArticle(article.content, referenceArticles);

        if (!enhancedContent || enhancedContent.length < 100) {
          throw new Error('AI returned insufficient content');
        }

        console.log(`  ✅ Enhanced content generated (${enhancedContent.length} characters)`);

        // Step 4: Save enhanced article
        console.log('\n💾 Step 4: Saving enhanced article...');
        
        const enhancedArticle = new Article({
          title: article.title,
          content: enhancedContent,
          author: article.author,
          date: article.date,
          url: article.url + '-enhanced',
          isUpdated: true,
          originalArticleId: article._id,
          references: referenceArticles.map(ref => ({
            url: ref.url,
            title: ref.title,
            scrapedAt: new Date()
          })),
          metadata: {
            ...article.metadata,
            enhancedAt: new Date()
          }
        });

        await enhancedArticle.save();
        
        console.log(`  ✅ Enhanced article saved!`);
        console.log(`     ID: ${enhancedArticle._id}`);
        console.log(`     Words: ${enhancedArticle.metadata?.wordCount || 0}`);
        console.log(`     References: ${referenceArticles.length}`);

        successCount++;

      } catch (error) {
        console.error(`\n  ❌ Error enhancing article: ${error.message}`);
        failCount++;
      }

      // Delay before next article
      if (i < articles.length - 1) {
        console.log(`\n⏱️  Waiting ${DELAY_BETWEEN_ARTICLES}ms before next article...\n`);
        await delay(DELAY_BETWEEN_ARTICLES);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 ENHANCEMENT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total articles processed: ${articles.length}`);
    console.log(`Successfully enhanced: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('='.repeat(70));

    // Show enhanced articles
    const enhancedArticles = await Article.find({ isUpdated: true })
      .populate('originalArticleId', 'title')
      .limit(10);

    if (enhancedArticles.length > 0) {
      console.log('\n✨ Enhanced Articles:');
      enhancedArticles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title}`);
        console.log(`     Original: ${article.originalArticleId?.title || 'N/A'}`);
        console.log(`     References: ${article.references?.length || 0}`);
      });
    }

    console.log('\n✅ Enhancement process completed!');
    console.log('💡 View articles at: http://localhost:5000/api/articles?isUpdated=true\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the enhancement
enhanceArticles();
