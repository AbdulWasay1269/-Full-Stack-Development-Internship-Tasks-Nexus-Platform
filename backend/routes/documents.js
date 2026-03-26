const express = require('express');
const {
  uploadDocument,
  getDocuments,
  signDocument
} = require('../controllers/documentController');

const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('documentFile'), uploadDocument);

router.route('/:id/sign')
  .put(protect, signDocument);

module.exports = router;
