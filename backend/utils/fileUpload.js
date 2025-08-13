const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uiet/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }
    ]
  }
});

// Storage for notes/documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uiet/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
    resource_type: 'raw'
  }
});

// Storage for merchandise images
const merchandiseImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uiet/merchandise',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fit' }
    ]
  }
});

// Storage for notification attachments
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = 'uiet/attachments';
    let resource_type = 'auto';
    
    if (file.mimetype.startsWith('image/')) {
      folder = 'uiet/attachments/images';
      resource_type = 'image';
    } else if (file.mimetype === 'application/pdf' || 
               file.mimetype.includes('document') || 
               file.mimetype.includes('text/')) {
      folder = 'uiet/attachments/documents';
      resource_type = 'raw';
    }
    
    return {
      folder: folder,
      resource_type: resource_type
    };
  }
});

// File size limits (in bytes)
const fileSizeLimits = {
  profilePicture: 5 * 1024 * 1024, // 5MB
  document: 50 * 1024 * 1024, // 50MB
  merchandiseImage: 10 * 1024 * 1024, // 10MB
  attachment: 25 * 1024 * 1024 // 25MB
};

// Multer configurations
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: { fileSize: fileSizeLimits.profilePicture },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'), false);
    }
  }
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: fileSizeLimits.document },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed'), false);
    }
  }
});

const uploadMerchandiseImage = multer({
  storage: merchandiseImageStorage,
  limits: { fileSize: fileSizeLimits.merchandiseImage },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for merchandise'), false);
    }
  }
});

const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: { fileSize: fileSizeLimits.attachment }
});

// Helper function to delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  uploadProfilePicture,
  uploadDocument,
  uploadMerchandiseImage,
  uploadAttachment,
  deleteFile,
  cloudinary
};
