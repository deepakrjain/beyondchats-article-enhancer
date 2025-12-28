/**
 * Check Word Counts Script
 * Displays word counts for all articles in the database
 */

require('dotenv').config();
const connectDB = require('../config/database');
const Article = require('../models/Article');

const checkWordCounts = async () => {
  try {
    await connectDB();

    const articles = await Article.find({ isUpdated: false })
      .select('title url metadata.wordCount metadata.readingTime')
      .sort({ createdAt: -1 });

    console.log('\n📊 ARTICLE WORD COUNTS\n');
    console.log('='.repeat(80));

    articles.forEach((article, index) => {
      const words = article.metadata?.wordCount || 0;
      const status = words > 300 ? '✅' : '❌';
      
      console.log(`\n${index + 1}. ${status} ${article.title}`);
      console.log(`   Words: ${words} | Reading time: ${article.metadata?.readingTime || 0} min`);
      console.log(`   ${article.url}`);
    });

    console.log('\n' + '='.repeat(80));
    
    const avgWords = Math.round(
      articles.reduce((sum, a) => sum + (a.metadata?.wordCount || 0), 0) / articles.length
    );
    
    const goodArticles = articles.filter(a => (a.metadata?.wordCount || 0) > 300).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total articles: ${articles.length}`);
    console.log(`   Average words: ${avgWords}`);
    console.log(`   Articles > 300 words: ${goodArticles}/${articles.length}`);
    
    if (avgWords < 300) {
      console.log('\n⚠️  Word counts are too low for effective AI enhancement!');
      console.log('💡 The scraper may need adjustment for this specific website.');
    } else {
      console.log('\n✅ Word counts look good for AI enhancement!');
    }
    
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkWordCounts();
