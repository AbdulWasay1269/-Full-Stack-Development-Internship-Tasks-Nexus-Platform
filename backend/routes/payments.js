const express = require('express');
const {
    createDepositIntent,
    mockWithdraw,
    mockTransfer,
    getTransactionHistory
} = require('../controllers/paymentController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/deposit', protect, createDepositIntent);
router.post('/withdraw', protect, mockWithdraw);
router.post('/transfer', protect, mockTransfer);
router.get('/history', protect, getTransactionHistory);

module.exports = router;
