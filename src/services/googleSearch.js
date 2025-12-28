/**
 * Google Search Service
 * Performs Google searches to find top-ranking articles
 * Uses custom scraping (100% free, no API key needed)
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

/**
 * Search Google and extract top blog/article URLs
 * @param {string} query - Search query (article title)
 * @param {number} limit - Number of results to return (default: 2)
 * @returns {Promise<Array>} Array of {url, title} objects
 */
const searchGoogle = async (query, limit = 2) => {
  let browser;
  
  try {
    console.log(`  🔍 Searching Google for: "${query}"`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Build Google search URL
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    // Navigate to Google
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for results
    await page.waitForTimeout(2000);

    // Extract search results
    const results = await page.evaluate(() => {
      const items = [];
      
      // Try different selectors for search results
      const resultSelectors = [
        'div.g',           // Standard result
        'div[data-hveid]', // Alternative
        '.rc',             // Classic selector
      ];

      let elements = [];
      for (const selector of resultSelectors) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) break;
      }

      elements.forEach((element) => {
        // Get link
        const linkEl = element.querySelector('a[href]');
        if (!linkEl) return;

        const url = linkEl.href;
        
        // Filter out non-article URLs (skip Google's own pages, PDFs, etc.)
        if (!url || 
            url.includes('google.com') || 
            url.includes('youtube.com') ||
            url.includes('facebook.com') ||
            url.includes('twitter.com') ||
            url.includes('linkedin.com') ||
            url.endsWith('.pdf')) {
          return;
        }

        // Get title
        const titleEl = element.querySelector('h3');
        const title = titleEl ? titleEl.textContent : url;

        items.push({ url, title });
      });

      return items;
    });

    console.log(`  ✅ Found ${results.length} search results`);

    // Filter and return top results
    const topResults = results.slice(0, limit);
    
    return topResults;

  } catch (error) {
    console.error(`  ❌ Google search error: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Alternative: Use DuckDuckGo HTML search (no JavaScript needed)
 * More reliable but slightly different results
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of results
 */
const searchDuckDuckGo = async (query, limit = 2) => {
  try {
    console.log(`  🦆 Searching DuckDuckGo for: "${query}"`);

    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const cheerio = require('cheerio');
    const $ = cheerio.load(response.data);

    const results = [];

    $('.result__a').each((i, el) => {
      if (results.length >= limit) return false;

      const url = $(el).attr('href');
      const title = $(el).text().trim();

      // Filter out unwanted domains
      if (url && 
          !url.includes('duckduckgo.com') && 
          !url.includes('youtube.com') &&
          !url.includes('facebook.com')) {
        results.push({ url, title });
      }
    });

    console.log(`  ✅ Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error(`  ❌ DuckDuckGo search error: ${error.message}`);
    return [];
  }
};

/**
 * Search with fallback strategy
 * Tries Google first, falls back to DuckDuckGo
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of results
 */
const search = async (query, limit = 2) => {
  // Try Google first
  let results = await searchGoogle(query, limit);

  // Fallback to DuckDuckGo if Google fails
  if (results.length === 0) {
    console.log('  ⚠️  Google search failed, trying DuckDuckGo...');
    results = await searchDuckDuckGo(query, limit);
  }

  // If still no results, log warning
  if (results.length === 0) {
    console.log('  ⚠️  No search results found for this query');
  }

  return results;
};

module.exports = {
  searchGoogle,
  searchDuckDuckGo,
  search
};
