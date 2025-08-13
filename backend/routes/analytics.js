const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const Merchandise = require('../models/Merchandise');
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics (Admin only)
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    // Recent user registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Content statistics
    const totalNotes = await Note.countDocuments({ isActive: true });
    const totalNotifications = await Notification.countDocuments({ isActive: true });
    const totalMerchandise = await Merchandise.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    // Revenue statistics
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly user registrations (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Monthly orders (last 12 months)
    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$totalAmount', 0] 
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Users by department
    const usersByDepartment = await User.aggregate([
      { $match: { department: { $exists: true, $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most active users (by login frequency)
    const mostActiveUsers = await User.find({ lastLogin: { $exists: true } })
      .select('firstName lastName email role lastLogin')
      .sort({ lastLogin: -1 })
      .limit(10);

    // Most downloaded notes
    const mostDownloadedNotes = await Note.find({ isActive: true })
      .select('title subject downloadCount')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ downloadCount: -1 })
      .limit(10);

    // Recent activities
    const recentNotes = await Note.find({ isActive: true })
      .select('title createdAt')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentNotifications = await Notification.find({ isActive: true })
      .select('title type priority createdAt')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .select('orderNumber totalAmount orderStatus createdAt')
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers,
          active: activeUsers,
          verified: verifiedUsers,
          recentRegistrations
        },
        content: {
          notes: totalNotes,
          notifications: totalNotifications,
          merchandise: totalMerchandise,
          orders: totalOrders
        },
        revenue: {
          total: totalRevenue
        }
      },
      charts: {
        monthlyRegistrations,
        monthlyOrders,
        usersByDepartment
      },
      lists: {
        mostActiveUsers,
        mostDownloadedNotes,
        recentActivities: {
          notes: recentNotes,
          notifications: recentNotifications,
          orders: recentOrders
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user engagement analytics (Admin only)
router.get('/user-engagement', auth, adminOnly, async (req, res) => {
  try {
    // User login frequency
    const loginFrequency = await User.aggregate([
      { $match: { lastLogin: { $exists: true } } },
      {
        $project: {
          daysSinceLastLogin: {
            $divide: [
              { $subtract: [new Date(), '$lastLogin'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$daysSinceLastLogin',
          boundaries: [0, 1, 7, 30, 90, 365, Infinity],
          default: 'Never',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Note download patterns
    const downloadPatterns = await Note.aggregate([
      {
        $group: {
          _id: '$subject',
          totalDownloads: { $sum: '$downloadCount' },
          averageDownloads: { $avg: '$downloadCount' },
          noteCount: { $sum: 1 }
        }
      },
      { $sort: { totalDownloads: -1 } }
    ]);

    // Notification engagement
    const notificationEngagement = await Notification.aggregate([
      {
        $project: {
          title: 1,
          type: 1,
          priority: 1,
          viewCount: 1,
          readCount: { $size: '$readBy' },
          createdAt: 1
        }
      },
      { $sort: { viewCount: -1 } },
      { $limit: 20 }
    ]);

    // Order patterns by time
    const orderPatterns = await Order.aggregate([
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            dayOfWeek: { $dayOfWeek: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
    ]);

    res.json({
      loginFrequency,
      downloadPatterns,
      notificationEngagement,
      orderPatterns
    });
  } catch (error) {
    console.error('Get user engagement analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get content performance analytics (Admin only)
router.get('/content-performance', auth, adminOnly, async (req, res) => {
  try {
    // Note performance metrics
    const notePerformance = await Note.aggregate([
      {
        $project: {
          title: 1,
          subject: 1,
          department: 1,
          semester: 1,
          downloadCount: 1,
          averageRating: 1,
          totalRatings: 1,
          createdAt: 1,
          uploadedBy: 1,
          performanceScore: {
            $add: [
              { $multiply: ['$downloadCount', 0.4] },
              { $multiply: ['$averageRating', 10] },
              { $multiply: ['$totalRatings', 2] }
            ]
          }
        }
      },
      { $sort: { performanceScore: -1 } },
      { $limit: 20 }
    ]);

    await Note.populate(notePerformance, { path: 'uploadedBy', select: 'firstName lastName' });

    // Merchandise performance
    const merchandisePerformance = await Merchandise.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          price: 1,
          totalSales: 1,
          averageRating: 1,
          totalRatings: 1,
          createdAt: 1,
          performanceScore: {
            $add: [
              { $multiply: ['$totalSales', 5] },
              { $multiply: ['$averageRating', 10] },
              { $multiply: ['$totalRatings', 2] }
            ]
          }
        }
      },
      { $sort: { performanceScore: -1 } },
      { $limit: 20 }
    ]);

    // Subject popularity
    const subjectPopularity = await Note.aggregate([
      {
        $group: {
          _id: '$subject',
          totalNotes: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
          averageRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { totalDownloads: -1 } }
    ]);

    // Category performance
    const categoryPerformance = await Merchandise.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalSales: { $sum: '$totalSales' },
          averageRating: { $avg: '$averageRating' },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({
      notePerformance,
      merchandisePerformance,
      subjectPopularity,
      categoryPerformance
    });
  } catch (error) {
    console.error('Get content performance analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get financial analytics (Admin only)
router.get('/financial', auth, adminOnly, async (req, res) => {
  try {
    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: twelveMonthsAgo },
          paymentStatus: 'completed'
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'merchandises',
          localField: 'items.merchandise',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.subtotal' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Payment method distribution
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$totalAmount', 0] 
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top customers
    const topCustomers = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    await User.populate(topCustomers, { 
      path: '_id', 
      select: 'firstName lastName email' 
    });

    res.json({
      monthlyRevenue,
      revenueByCategory,
      paymentMethods,
      orderStatusDistribution,
      topCustomers
    });
  } catch (error) {
    console.error('Get financial analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
