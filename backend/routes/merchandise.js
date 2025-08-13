const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Merchandise = require('../models/Merchandise');
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');
const { uploadMerchandiseImage } = require('../utils/fileUpload');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Get merchandise with filtering and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['clothing', 'accessories', 'books', 'electronics', 'stationery', 'sports', 'other']).withMessage('Invalid category'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  query('search').optional().notEmpty().withMessage('Search query cannot be empty'),
  query('sortBy').optional().isIn(['createdAt', 'name', 'price', 'averageRating', 'totalSales']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured !== undefined) filter.isFeatured = req.query.featured === 'true';

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const merchandise = await Merchandise.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalProducts = await Merchandise.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      merchandise,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get merchandise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get merchandise by ID
router.get('/:id', async (req, res) => {
  try {
    const merchandise = await Merchandise.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('ratings.user', 'firstName lastName');

    if (!merchandise) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!merchandise.isActive) {
      return res.status(404).json({ message: 'Product not available' });
    }

    res.json({ merchandise });
  } catch (error) {
    console.error('Get merchandise by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create merchandise (Admin only)
router.post('/', auth, adminOnly, uploadMerchandiseImage.array('images', 5), [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['clothing', 'accessories', 'books', 'electronics', 'stationery', 'sports', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('variants').optional().isArray().withMessage('Variants must be an array'),
  body('inventory').optional().isArray().withMessage('Inventory must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('specifications').optional().isArray().withMessage('Specifications must be an array'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      name,
      description,
      category,
      price,
      originalPrice,
      discount = 0,
      variants = [],
      inventory = [],
      tags = [],
      specifications = [],
      isFeatured = false
    } = req.body;

    // Process uploaded images
    const images = req.files ? req.files.map((file, index) => ({
      url: file.path,
      alt: `${name} - Image ${index + 1}`,
      isPrimary: index === 0
    })) : [];

    // Parse JSON fields if they're strings
    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    const parsedInventory = typeof inventory === 'string' ? JSON.parse(inventory) : inventory;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    const parsedSpecifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

    const merchandise = new Merchandise({
      name,
      description,
      category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: parseFloat(discount),
      images,
      variants: parsedVariants,
      inventory: parsedInventory,
      tags: parsedTags,
      specifications: parsedSpecifications,
      isFeatured,
      createdBy: req.user._id
    });

    await merchandise.save();
    await merchandise.populate('createdBy', 'firstName lastName');

    res.status(201).json({ 
      message: 'Product created successfully',
      merchandise 
    });
  } catch (error) {
    console.error('Create merchandise error:', error);
    res.status(500).json({ message: 'Server error during product creation' });
  }
});

// Update merchandise (Admin only)
router.put('/:id', auth, adminOnly, uploadMerchandiseImage.array('newImages', 5), [
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['clothing', 'accessories', 'books', 'electronics', 'stationery', 'sports', 'other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const merchandise = await Merchandise.findById(req.params.id);

    if (!merchandise) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update basic fields
    const updateFields = ['name', 'description', 'category', 'price', 'originalPrice', 'discount', 'isActive', 'isFeatured'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        merchandise[field] = req.body[field];
      }
    });

    // Update arrays if provided
    if (req.body.variants) {
      merchandise.variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    }
    if (req.body.inventory) {
      merchandise.inventory = typeof req.body.inventory === 'string' ? JSON.parse(req.body.inventory) : req.body.inventory;
    }
    if (req.body.tags) {
      merchandise.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
    }
    if (req.body.specifications) {
      merchandise.specifications = typeof req.body.specifications === 'string' ? JSON.parse(req.body.specifications) : req.body.specifications;
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        alt: `${merchandise.name} - New Image ${index + 1}`,
        isPrimary: false
      }));
      merchandise.images.push(...newImages);
    }

    await merchandise.save();
    await merchandise.populate('createdBy', 'firstName lastName');

    res.json({ 
      message: 'Product updated successfully',
      merchandise 
    });
  } catch (error) {
    console.error('Update merchandise error:', error);
    res.status(500).json({ message: 'Server error during product update' });
  }
});

// Delete merchandise (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const merchandise = await Merchandise.findByIdAndDelete(req.params.id);

    if (!merchandise) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete merchandise error:', error);
    res.status(500).json({ message: 'Server error during product deletion' });
  }
});

// Rate merchandise (Authenticated users only)
router.post('/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { rating, review } = req.body;
    const merchandise = await Merchandise.findById(req.params.id);

    if (!merchandise) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already rated this product
    const existingRatingIndex = merchandise.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      merchandise.ratings[existingRatingIndex].rating = rating;
      merchandise.ratings[existingRatingIndex].review = review || '';
      merchandise.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      merchandise.ratings.push({
        user: req.user._id,
        rating,
        review: review || '',
        createdAt: new Date()
      });
    }

    await merchandise.updateAverageRating();

    res.json({ 
      message: 'Product rated successfully',
      averageRating: merchandise.averageRating,
      totalRatings: merchandise.totalRatings
    });
  } catch (error) {
    console.error('Rate merchandise error:', error);
    res.status(500).json({ message: 'Server error during rating' });
  }
});

// Create order (Authenticated users only)
router.post('/order', auth, [
  body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
  body('items.*.merchandise').notEmpty().withMessage('Merchandise ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.variant').optional().notEmpty().withMessage('Variant cannot be empty'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').isIn(['stripe', 'razorpay', 'cod']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate and calculate order total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const merchandise = await Merchandise.findById(item.merchandise);
      if (!merchandise || !merchandise.isActive) {
        return res.status(400).json({ message: `Product not found or unavailable: ${item.merchandise}` });
      }

      // Check stock availability
      if (item.variant) {
        const inventoryItem = merchandise.inventory.find(inv => inv.variant === item.variant);
        if (!inventoryItem || inventoryItem.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${merchandise.name} - ${item.variant}` 
          });
        }
      } else if (merchandise.totalStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${merchandise.name}` 
        });
      }

      const subtotal = merchandise.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        merchandise: merchandise._id,
        name: merchandise.name,
        price: merchandise.price,
        quantity: item.quantity,
        variant: item.variant || '',
        subtotal
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
      notes
    });

    await order.save();

    // Handle payment based on method
    let paymentData = {};

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'inr',
          metadata: {
            orderId: order._id.toString(),
            userId: req.user._id.toString()
          }
        });

        paymentData = {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        };
      } catch (stripeError) {
        console.error('Stripe payment intent creation failed:', stripeError);
        return res.status(500).json({ message: 'Payment processing failed' });
      }
    }

    res.status(201).json({ 
      message: 'Order created successfully',
      order,
      paymentData
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// Get user's orders
router.get('/orders/my-orders', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('status').optional().isIn(['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) filter.orderStatus = req.query.status;

    const orders = await Order.find(filter)
      .populate('items.merchandise', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories for filtering
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Merchandise.distinct('category', { isActive: true });
    res.json({ categories: categories.sort() });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get merchandise statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    // Basic statistics
    const totalProducts = await Merchandise.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Products by category
    const productsByCategory = await Merchandise.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Best selling products
    const bestSelling = await Merchandise.find({ isActive: true })
      .select('name category totalSales price')
      .sort({ totalSales: -1 })
      .limit(5);

    // Recent orders (if admin)
    let recentOrders = [];
    if (req.user.role === 'admin') {
      recentOrders = await Order.find()
        .populate('user', 'firstName lastName')
        .populate('items.merchandise', 'name')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.json({
      overview: {
        totalProducts,
        totalOrders,
        totalRevenue
      },
      productsByCategory,
      bestSelling,
      recentOrders
    });
  } catch (error) {
    console.error('Get merchandise statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
