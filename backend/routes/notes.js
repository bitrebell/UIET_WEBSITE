const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Note = require('../models/Note');
const { auth, teacherOrAdmin } = require('../middleware/auth');
const { uploadDocument } = require('../utils/fileUpload');

const router = express.Router();

// Get notes with filtering and search
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('subject').optional().notEmpty().withMessage('Subject filter cannot be empty'),
  query('department').optional().notEmpty().withMessage('Department filter cannot be empty'),
  query('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  query('search').optional().notEmpty().withMessage('Search query cannot be empty'),
  query('sortBy').optional().isIn(['createdAt', 'title', 'downloadCount', 'averageRating']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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

    // Build filter object
    const filter = { isActive: true };

    // For students, filter by their department and semester
    if (req.user.role === 'student') {
      filter.department = req.user.department;
      filter.semester = req.user.semester;
    }

    // Apply additional filters
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
    if (req.query.department && req.user.role !== 'student') filter.department = req.query.department;
    if (req.query.semester && req.user.role !== 'student') filter.semester = req.query.semester;

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'firstName lastName')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalNotes = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalNotes / limit);

    res.json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get note by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName')
      .populate('ratings.user', 'firstName lastName');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check access permissions for students
    if (req.user.role === 'student' && 
        (note.department !== req.user.department || note.semester !== req.user.semester)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ note });
  } catch (error) {
    console.error('Get note by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download note
router.get('/:id/download', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check access permissions for students
    if (req.user.role === 'student' && 
        (note.department !== req.user.department || note.semester !== req.user.semester)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment download count
    note.downloadCount += 1;
    await note.save();

    res.json({ 
      message: 'Download initiated',
      downloadUrl: note.fileUrl,
      fileName: note.fileName
    });
  } catch (error) {
    console.error('Download note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload note (Teachers and Admins only)
router.post('/', auth, teacherOrAdmin, uploadDocument.single('noteFile'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const {
      title,
      description,
      subject,
      department,
      semester,
      tags = []
    } = req.body;

    const note = new Note({
      title,
      description,
      subject,
      department,
      semester: parseInt(semester),
      uploadedBy: req.user._id,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      tags: Array.isArray(tags) ? tags : []
    });

    await note.save();
    await note.populate('uploadedBy', 'firstName lastName');

    res.status(201).json({ 
      message: 'Note uploaded successfully',
      note 
    });
  } catch (error) {
    console.error('Upload note error:', error);
    res.status(500).json({ message: 'Server error during note upload' });
  }
});

// Update note (Creator or Admin only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    const updateFields = ['title', 'description', 'subject', 'department', 'semester', 'tags', 'isActive'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        note[field] = req.body[field];
      }
    });

    await note.save();
    await note.populate('uploadedBy', 'firstName lastName');

    res.json({ 
      message: 'Note updated successfully',
      note 
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error during note update' });
  }
});

// Delete note (Creator or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error during note deletion' });
  }
});

// Rate note
router.post('/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 200 }).withMessage('Review cannot exceed 200 characters')
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
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user already rated this note
    const existingRatingIndex = note.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      note.ratings[existingRatingIndex].rating = rating;
      note.ratings[existingRatingIndex].review = review || '';
      note.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      note.ratings.push({
        user: req.user._id,
        rating,
        review: review || '',
        createdAt: new Date()
      });
    }

    await note.updateAverageRating();

    res.json({ 
      message: 'Note rated successfully',
      averageRating: note.averageRating,
      totalRatings: note.totalRatings
    });
  } catch (error) {
    console.error('Rate note error:', error);
    res.status(500).json({ message: 'Server error during rating' });
  }
});

// Get subjects for dropdown (based on user's department)
router.get('/subjects/list', auth, async (req, res) => {
  try {
    let filter = { isActive: true };
    
    // For students, filter by their department and semester
    if (req.user.role === 'student') {
      filter.department = req.user.department;
      filter.semester = req.user.semester;
    } else if (req.query.department) {
      filter.department = req.query.department;
    }

    if (req.query.semester) {
      filter.semester = parseInt(req.query.semester);
    }

    const subjects = await Note.distinct('subject', filter);
    
    res.json({ subjects: subjects.sort() });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get note statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let filter = { isActive: true };
    let statsTitle = 'Overall Notes Statistics';

    // For students, show stats for their department and semester
    if (req.user.role === 'student') {
      filter.department = req.user.department;
      filter.semester = req.user.semester;
      statsTitle = `Notes Statistics for ${req.user.department} - Semester ${req.user.semester}`;
    }

    const totalNotes = await Note.countDocuments(filter);
    const totalDownloads = await Note.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    // Get notes by subject
    const notesBySubject = await Note.aggregate([
      { $match: filter },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get most downloaded notes
    const mostDownloaded = await Note.find(filter)
      .select('title subject downloadCount')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ downloadCount: -1 })
      .limit(5);

    // Get highest rated notes
    const highestRated = await Note.find({
      ...filter,
      averageRating: { $gt: 0 }
    })
      .select('title subject averageRating totalRatings')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(5);

    res.json({
      title: statsTitle,
      overview: {
        totalNotes,
        totalDownloads: totalDownloads[0]?.total || 0
      },
      notesBySubject,
      mostDownloaded,
      highestRated
    });
  } catch (error) {
    console.error('Get note statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
