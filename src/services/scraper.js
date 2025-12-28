/**
 * Web Scraper Service
 * Scrapes articles from BeyondChats blog using Puppeteer
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Scrape articles from BeyondChats blog
 * @param {number} count - Number of articles to scrape (default: 5)
 * @returns {Promise<Array>} Array of article objects
 */
const scrapeBeyondChatsArticles = async (count = 5) => {
  let browser;
  
  try {
    console.log('🌐 Launching browser...');
    
    // Launch Puppeteer with optimized settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('📄 Navigating to BeyondChats blog...');
    
    // Navigate to the blog page
    await page.goto('https://beyondchats.com/blogs/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('🔍 Finding articles...');

    // Get the page HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    const articles = [];
    const articleElements = [];

    // Try multiple selectors to find article cards
    // Adjust these selectors based on actual website structure
    const possibleSelectors = [
      'article',
      '.blog-post',
      '.post',
      '.article-card',
      '[class*="article"]',
      '[class*="post"]',
      'a[href*="/blogs/"]'
    ];

    let foundArticles = false;
    
    for (const selector of possibleSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} articles using selector: ${selector}`);
        elements.each((i, el) => articleElements.push($(el)));
        foundArticles = true;
        break;
      }
    }

    if (!foundArticles) {
      console.log('⚠️  Using fallback: extracting all links');
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/blogs/') && href !== '/blogs/') {
          articleElements.push($(el));
        }
      });
    }

    // Get the last N articles (oldest ones from the last page)
    const targetArticles = articleElements.slice(-count);

    console.log(`📝 Processing ${targetArticles.length} articles...`);

    // Process each article
    for (let i = 0; i < targetArticles.length; i++) {
      const element = targetArticles[i];
      
      try {
        // Extract article URL
        let articleUrl = element.attr('href') || element.find('a').first().attr('href');
        
        if (!articleUrl) continue;
        
        // Make URL absolute if relative
        if (articleUrl.startsWith('/')) {
          articleUrl = `https://beyondchats.com${articleUrl}`;
        }

        console.log(`  ${i + 1}. Scraping: ${articleUrl}`);

        // Visit article page
        await page.goto(articleUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Wait for content to load - try multiple strategies
        try {
          await page.waitForSelector('article, .entry-content, .post-content', { timeout: 5000 });
        } catch {
          // Content selector not found, continue anyway
        }

        // Scroll to load lazy content
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Wait for any lazy-loaded content
        await page.waitForTimeout(3000);

        // Extract article content
        const articleData = await page.evaluate(() => {
          // Helper function to extract text content
          const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : '';
          };

          const getHTML = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.innerHTML.trim() : '';
          };

          // Extract title
          const title = getText('h1') || 
                       getText('.article-title') || 
                       getText('[class*="title"]') ||
                       document.title.split('|')[0].trim();

          // Try multiple strategies to get full content
          let content = '';
          
          // Strategy 1: Look for common blog content containers
          const contentSelectors = [
            '.entry-content',
            '.post-content', 
            '.article-content',
            '.blog-content',
            '[class*="post-body"]',
            '[class*="entry-body"]',
            'article .content',
            'article > div',
            '.elementor-widget-container',
            '[data-elementor-type="wp-post"]',
            '.elementor-element',
            '.content-area',
            'main article'
          ];

          for (const selector of contentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerHTML.length > 200) {
              content = el.innerHTML;
              console.log(`Found content with: ${selector}, length: ${el.innerHTML.length}`);
              break;
            }
          }

          // Strategy 2: If no content found, get all text-rich elements from article
          if (!content || content.length < 200) {
            const article = document.querySelector('article') || document.querySelector('main') || document.querySelector('.post');
            if (article) {
              const elements = article.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre');
              if (elements.length > 0) {
                content = Array.from(elements)
                  .map(p => p.outerHTML)
                  .join('\n');
                console.log(`Found ${elements.length} content elements`);
              }
            }
          }

          // Strategy 3: Get everything from body, then clean
          if (!content || content.length < 200) {
            const main = document.querySelector('main') || document.querySelector('article') || document.querySelector('.site-content');
            if (main) {
              content = main.innerHTML;
              console.log('Using main/article container');
            } else {
              content = document.body.innerHTML;
              console.log('Fallback to body');
            }
          }

          // Extract author
          const author = getText('.author') || 
                        getText('[class*="author"]') || 
                        getText('[rel="author"]') ||
                        getText('.post-author') ||
                        'BeyondChats';

          // Extract date
          const dateText = getText('time') || 
                          getText('.date') || 
                          getText('[class*="date"]') ||
                          getText('.published') ||
                          new Date().toISOString();

          return {
            title,
            content,
            author,
            dateText
          };
        });

        // Parse date
        let articleDate;
        try {
          articleDate = new Date(articleData.dateText);
          if (isNaN(articleDate)) {
            articleDate = new Date();
          }
        } catch {
          articleDate = new Date();
        }

        // Clean content (remove scripts, styles, etc.)
        const cleanContent = cleanHTML(articleData.content);

        articles.push({
          title: articleData.title || 'Untitled Article',
          content: cleanContent,
          author: articleData.author || 'BeyondChats',
          date: articleDate,
          url: articleUrl,
          metadata: {
            scrapedAt: new Date(),
            wordCount: cleanContent.split(/\s+/).length
          }
        });

        console.log(`  ✅ Successfully scraped: ${articleData.title}`);

        // Delay to avoid overwhelming the server
        await page.waitForTimeout(parseInt(process.env.SCRAPING_DELAY_MS) || 2000);

      } catch (error) {
        console.error(`  ❌ Error scraping article ${i + 1}:`, error.message);
        continue;
      }
    }

    console.log(`\n✅ Successfully scraped ${articles.length} articles\n`);
    return articles;

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
};

/**
 * Clean HTML content
 * @param {string} html - Raw HTML content
 * @returns {string} Cleaned HTML
 */
const cleanHTML = (html) => {
  const $ = cheerio.load(html);
  
  // Remove unwanted elements
  $('script').remove();
  $('style').remove();
  $('iframe').remove();
  $('noscript').remove();
  $('.advertisement').remove();
  $('.ad').remove();
  $('[class*="cookie"]').remove();
  $('[class*="popup"]').remove();
  
  // Get cleaned HTML
  return $.html();
};

/**
 * Scrape a single article from a URL
 * @param {string} url - Article URL
 * @returns {Promise<Object>} Article data
 */
const scrapeArticle = async (url) => {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(1500);

    const articleData = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };

      const getHTML = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerHTML.trim() : '';
      };

      const title = getText('h1') || 
                   getText('.article-title') || 
                   document.title;

      // Try multiple content strategies
      let content = '';
      const contentSelectors = [
        '.entry-content',
        '.post-content', 
        '.article-content',
        '[class*="post-body"]',
        '.elementor-widget-container'
      ];

      for (const selector of contentSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerHTML.length > 200) {
          content = el.innerHTML;
          break;
        }
      }

      if (!content || content.length < 200) {
        const article = document.querySelector('article') || document.querySelector('main');
        if (article) {
          const paragraphs = article.querySelectorAll('p, h2, h3, h4, ul, ol');
          if (paragraphs.length > 0) {
            content = Array.from(paragraphs).map(p => p.outerHTML).join('\n');
          }
        }
      }

      if (!content) {
        content = getHTML('article') || getHTML('main') || document.body.innerHTML;
      }

      return { title, content };
    });

    return {
      url,
      title: articleData.title,
      content: cleanHTML(articleData.content)
    };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  scrapeBeyondChatsArticles,
  scrapeArticle,
  cleanHTML
};
