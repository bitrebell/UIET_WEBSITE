const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, teacherOrAdmin } = require('../middleware/auth');
const { uploadAttachment } = require('../utils/fileUpload');
const { sendNotificationEmail } = require('../utils/emailService');

const router = express.Router();

// Get notifications for current user
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['general', 'academic', 'event', 'urgent', 'maintenance']).withMessage('Invalid notification type'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be a boolean')
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

    // Build filter for user's notifications
    const filter = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ],
      $and: [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: req.user.role },
            { targetAudience: { $in: ['all', req.user.role] } }
          ]
        }
      ]
    };

    // Filter by department if user has one
    if (req.user.department) {
      filter.$and.push({
        $or: [
          { targetDepartments: { $size: 0 } },
          { targetDepartments: req.user.department }
        ]
      });
    }

    // Filter by semester for students
    if (req.user.role === 'student' && req.user.semester) {
      filter.$and.push({
        $or: [
          { targetSemesters: { $size: 0 } },
          { targetSemesters: req.user.semester }
        ]
      });
    }

    // Additional filters
    if (req.query.type) filter.type = req.query.type;
    if (req.query.priority) filter.priority = req.query.priority;

    // Filter for unread notifications
    if (req.query.unreadOnly === 'true') {
      filter['readBy.user'] = { $ne: req.user._id };
    }

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limit);

    // Mark notifications as viewed (increment view count)
    const notificationIds = notifications.map(n => n._id);
    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $inc: { viewCount: 1 } }
    );

    // Add read status to each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const isRead = notification.readBy.some(
        readEntry => readEntry.user.toString() === req.user._id.toString()
      );
      return {
        ...notification.toObject(),
        isRead
      };
    });

    res.json({
      notifications: notificationsWithReadStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user should have access to this notification
    const hasAccess = 
      notification.targetAudience.includes('all') ||
      notification.targetAudience.includes(req.user.role) ||
      (notification.targetDepartments.length === 0 || notification.targetDepartments.includes(req.user.department)) ||
      (notification.targetSemesters.length === 0 || notification.targetSemesters.includes(req.user.semester));

    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isRead = notification.readBy.some(
      readEntry => readEntry.user.toString() === req.user._id.toString()
    );

    res.json({
      notification: {
        ...notification.toObject(),
        isRead
      }
    });
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if already marked as read
    const alreadyRead = notification.readBy.some(
      readEntry => readEntry.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (Teachers and Admins only)
router.post('/', auth, teacherOrAdmin, uploadAttachment.array('attachments', 5), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('type').isIn(['general', 'academic', 'event', 'urgent', 'maintenance']).withMessage('Invalid notification type'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('targetAudience').isArray({ min: 1 }).withMessage('Target audience must be an array with at least one item'),
  body('targetAudience.*').isIn(['all', 'students', 'teachers', 'admin']).withMessage('Invalid target audience'),
  body('targetDepartments').optional().isArray().withMessage('Target departments must be an array'),
  body('targetSemesters').optional().isArray().withMessage('Target semesters must be an array'),
  body('targetSemesters.*').optional().isInt({ min: 1, max: 8 }).withMessage('Invalid semester'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
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
      title,
      message,
      type,
      priority,
      targetAudience,
      targetDepartments = [],
      targetSemesters = [],
      expiresAt
    } = req.body;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: file.path,
      fileType: file.mimetype,
      fileSize: file.size
    })) : [];

    const notification = new Notification({
      title,
      message,
      type,
      priority,
      targetAudience,
      targetDepartments,
      targetSemesters,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      attachments,
      createdBy: req.user._id
    });

    await notification.save();

    // Populate creator info
    await notification.populate('createdBy', 'firstName lastName');

    // Send email notifications to targeted users (async)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false') {
      setImmediate(async () => {
        try {
          await sendEmailNotifications(notification);
        } catch (emailError) {
          console.error('Error sending email notifications:', emailError);
        }
      });
    }

    res.status(201).json({ 
      message: 'Notification created successfully',
      notification 
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error during notification creation' });
  }
});

// Update notification (Creator or Admin only)
router.put('/:id', auth, uploadAttachment.array('newAttachments', 5), [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('message').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('type').optional().isIn(['general', 'academic', 'event', 'urgent', 'maintenance']).withMessage('Invalid notification type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && notification.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    const updateFields = ['title', 'message', 'type', 'priority', 'isActive', 'expiresAt'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        notification[field] = req.body[field];
      }
    });

    // Handle new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size
      }));
      notification.attachments.push(...newAttachments);
    }

    await notification.save();
    await notification.populate('createdBy', 'firstName lastName');

    res.json({ 
      message: 'Notification updated successfully',
      notification 
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ message: 'Server error during notification update' });
  }
});

// Delete notification (Creator or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && notification.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error during notification deletion' });
  }
});

// Get notification statistics (Admin only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalNotifications = await Notification.countDocuments();
    const activeNotifications = await Notification.countDocuments({ isActive: true });
    const expiredNotifications = await Notification.countDocuments({ 
      expiresAt: { $lt: new Date() } 
    });

    // Get notifications by type
    const notificationsByType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get notifications by priority
    const notificationsByPriority = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent notifications (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentNotifications = await Notification.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      overview: {
        totalNotifications,
        activeNotifications,
        expiredNotifications,
        recentNotifications
      },
      notificationsByType,
      notificationsByPriority
    });
  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to send email notifications
async function sendEmailNotifications(notification) {
  try {
    // Build user query based on target audience
    const userQuery = {
      isEmailVerified: true,
      isActive: true
    };

    // Filter by role
    if (!notification.targetAudience.includes('all')) {
      userQuery.role = { $in: notification.targetAudience };
    }

    // Filter by department
    if (notification.targetDepartments.length > 0) {
      userQuery.department = { $in: notification.targetDepartments };
    }

    // Filter by semester for students
    if (notification.targetSemesters.length > 0) {
      userQuery.$or = [
        { role: { $ne: 'student' } },
        { role: 'student', semester: { $in: notification.targetSemesters } }
      ];
    }

    const users = await User.find(userQuery).select('email firstName');

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const emailPromises = batch.map(user => 
        sendNotificationEmail(
          user.email,
          notification.title,
          notification.message,
          user.firstName
        ).catch(error => {
          console.error(`Failed to send email to ${user.email}:`, error);
        })
      );

      await Promise.allSettled(emailPromises);
      
      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error in sendEmailNotifications:', error);
  }
}

module.exports = router;
