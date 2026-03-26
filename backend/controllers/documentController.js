const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// @desc      Upload document
// @route     POST /api/documents
// @access    Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { title } = req.body;
    if (!title) {
        // Cleanup orphaned upload
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, error: 'Please provide a document title' });
    }

    const document = await Document.create({
      title,
      filename: req.file.originalname,
      filepath: req.file.filename, // we stored UUID filename inside local limits
      uploadedBy: req.user.id,
      version: 1,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (err) {
    // If saving fails, remove file from disk
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get all documents for a user
// @route     GET /api/documents
// @access    Private
exports.getDocuments = async (req, res, next) => {
  try {
    // Basic query implementation, can be extended based on Investor/Entrepreneur linkage
    const documents = await Document.find({ uploadedBy: req.user.id })
        .populate('uploadedBy', 'name email');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Sign Document (E-Signature)
// @route     PUT /api/documents/:id/sign
// @access    Private
exports.signDocument = async (req, res, next) => {
    try {
        const { signatureDataURI } = req.body;

        if (!signatureDataURI) {
            return res.status(400).json({ success: false, error: 'Signature data is required' });
        }

        let document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        document.signature = signatureDataURI;
        document.status = 'signed';
        document.signedBy = req.user.id;
        
        await document.save();

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
