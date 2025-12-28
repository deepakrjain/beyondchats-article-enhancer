/**
 * Article Model
 * Mongoose schema for storing blog articles (both original and enhanced versions)
 */

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters']
    },
    
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    
    author: {
      type: String,
      trim: true,
      default: 'Unknown'
    },
    
    date: {
      type: Date,
      default: Date.now
    },
    
    url: {
      type: String,
      required: [true, 'Article URL is required'],
      trim: true
    },
    
    isUpdated: {
      type: Boolean,
      default: false
    },
    
    originalArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null
    },
    
    // Additional fields for enhanced articles
    references: [{
      url: String,
      title: String,
      scrapedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Metadata for tracking
    metadata: {
      scrapedAt: {
        type: Date,
        default: Date.now
      },
      enhancedAt: Date,
      wordCount: Number,
      readingTime: Number, // in minutes
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
articleSchema.index({ isUpdated: 1, createdAt: -1 });
articleSchema.index({ originalArticleId: 1 });
articleSchema.index({ url: 1 }, { unique: false });

// Virtual field to get excerpt
articleSchema.virtual('excerpt').get(function() {
  if (!this.content) return '';
  const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
});

// Method to calculate reading time
articleSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const plainText = this.content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  this.metadata.wordCount = wordCount;
  this.metadata.readingTime = readingTime;
  
  return readingTime;
};

// Pre-save middleware to calculate metadata
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.calculateReadingTime();
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
