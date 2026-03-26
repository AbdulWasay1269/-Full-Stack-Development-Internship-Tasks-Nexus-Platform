const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage for local uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Make sure 'uploads/' directory exists
    },
    filename(req, file, cb) {
        // Generate a unique filename using crypto and preserve the original extension
        const ext = path.extname(file.originalname);
        cb(null, `${crypto.randomUUID()}${ext}`);
    }
});

// Configure file filter (accept only specific types)
const fileFilter = (req, file, cb) => {
    // Only accept PDFs or DOCs conceptually
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and DOC/DOCX allow.'), false);
    }
};

// Initialize multer upload middleware
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter
});

module.exports = upload;