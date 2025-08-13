const mongoose = require('mongoose');

const merchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['clothing', 'accessories', 'books', 'electronics', 'stationery', 'sports', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [String] // e.g., ["S", "M", "L"], ["Red", "Blue", "Green"]
  }],
  inventory: [{
    variant: String, // e.g., "Size-S-Color-Red"
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative']
    },
    sku: String
  }],
  totalStock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: [{
    name: String,
    value: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
merchandiseSchema.index({ category: 1 });
merchandiseSchema.index({ price: 1 });
merchandiseSchema.index({ isActive: 1 });
merchandiseSchema.index({ isFeatured: 1 });
merchandiseSchema.index({ averageRating: -1 });
merchandiseSchema.index({ totalSales: -1 });
merchandiseSchema.index({ createdAt: -1 });
merchandiseSchema.index({ tags: 1 });

// Text index for search functionality
merchandiseSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

// Calculate total stock from inventory
merchandiseSchema.pre('save', function(next) {
  if (this.inventory && this.inventory.length > 0) {
    this.totalStock = this.inventory.reduce((total, item) => total + item.stock, 0);
  }
  next();
});

// Update average rating when ratings change
merchandiseSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
  return this.save();
};

module.exports = mongoose.model('Merchandise', merchandiseSchema);
