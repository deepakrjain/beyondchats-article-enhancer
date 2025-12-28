/**
 * AI Service
 * Integrates with free LLM APIs (Groq, Hugging Face, Together AI)
 * for article enhancement
 */

const axios = require('axios');

/**
 * Enhance article using Groq API (Free tier: 14,400 requests/day)
 * Models: llama-3.3-70b-versatile, mixtral-8x7b-32768
 * @param {string} originalArticle - Original article content
 * @param {Array} referenceArticles - Array of reference article contents
 * @returns {Promise<string>} Enhanced article content
 */
const enhanceWithGroq = async (originalArticle, referenceArticles = []) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    // Build prompt
    const prompt = buildEnhancementPrompt(originalArticle, referenceArticles);

    console.log('  🤖 Calling Groq API for enhancement...');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile', // Fast and good quality
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer and SEO specialist. Rewrite articles to improve quality, readability, and SEO while maintaining the core message.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds
      }
    );

    const enhancedContent = response.data.choices[0].message.content;
    console.log('  ✅ Article enhanced successfully');
    
    return enhancedContent;

  } catch (error) {
    if (error.response) {
      console.error('  ❌ Groq API error:', error.response.data);
      throw new Error(`Groq API error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw error;
  }
};

/**
 * Enhance article using Hugging Face Inference API (100% free)
 * Model: mistralai/Mixtral-8x7B-Instruct-v0.1
 * @param {string} originalArticle - Original article content
 * @param {Array} referenceArticles - Reference articles
 * @returns {Promise<string>} Enhanced article
 */
const enhanceWithHuggingFace = async (originalArticle, referenceArticles = []) => {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY not found in environment variables');
    }

    const prompt = buildEnhancementPrompt(originalArticle, referenceArticles);

    console.log('  🤗 Calling Hugging Face API...');

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes (HF can be slower)
      }
    );

    const enhancedContent = response.data[0].generated_text;
    console.log('  ✅ Article enhanced successfully');
    
    return enhancedContent;

  } catch (error) {
    if (error.response?.status === 503) {
      throw new Error('Model is loading. Please try again in a few minutes.');
    }
    if (error.response) {
      console.error('  ❌ Hugging Face API error:', error.response.data);
    }
    throw error;
  }
};

/**
 * Build enhancement prompt for LLM
 * @param {string} originalArticle - Original article
 * @param {Array} referenceArticles - Reference articles [{content, title, url}]
 * @returns {string} Formatted prompt
 */
const buildEnhancementPrompt = (originalArticle, referenceArticles = []) => {
  // Clean HTML from original
  const cleanOriginal = stripHTML(originalArticle);
  
  let prompt = `Rewrite this article to match the style, formatting, and structure of top-ranking articles. Maintain the core message but improve readability and SEO.

ORIGINAL ARTICLE:
${cleanOriginal.substring(0, 3000)}

`;

  // Add reference articles if available
  if (referenceArticles.length > 0) {
    prompt += `REFERENCE ARTICLES (top-ranking content for inspiration):\n\n`;
    
    referenceArticles.forEach((ref, index) => {
      const cleanRef = stripHTML(ref.content);
      prompt += `Reference ${index + 1} (${ref.title}):\n${cleanRef.substring(0, 1500)}\n\n`;
    });
  }

  prompt += `
INSTRUCTIONS:
1. Rewrite the original article with improved structure and flow
2. Use clear headings (H2, H3) for better organization
3. Make it more engaging and reader-friendly
4. Add relevant keywords naturally for SEO
5. Keep the tone professional but conversational
6. Maintain factual accuracy from the original
7. Output in clean HTML format with proper tags (<h2>, <p>, <ul>, etc.)
8. Aim for similar or slightly longer length than original

Enhanced article:`;

  return prompt;
};

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
const stripHTML = (html) => {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Main enhance function with automatic fallback
 * Tries Groq first, falls back to Hugging Face
 * @param {string} originalArticle - Original article
 * @param {Array} referenceArticles - Reference articles
 * @returns {Promise<string>} Enhanced article
 */
const enhanceArticle = async (originalArticle, referenceArticles = []) => {
  // Try Groq first (fastest and most reliable)
  if (process.env.GROQ_API_KEY) {
    try {
      return await enhanceWithGroq(originalArticle, referenceArticles);
    } catch (error) {
      console.log('  ⚠️  Groq failed, trying Hugging Face...');
    }
  }

  // Fallback to Hugging Face
  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      return await enhanceWithHuggingFace(originalArticle, referenceArticles);
    } catch (error) {
      console.log('  ⚠️  Hugging Face failed');
    }
  }

  throw new Error('No AI API keys configured. Please add GROQ_API_KEY or HUGGINGFACE_API_KEY to .env');
};

module.exports = {
  enhanceArticle,
  enhanceWithGroq,
  enhanceWithHuggingFace,
  stripHTML
};
