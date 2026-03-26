const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_now'); 
const Transaction = require('../models/Transaction');

// @desc      Create a PaymentIntent to deposit funds
// @route     POST /api/payments/deposit
// @access    Private
exports.createDepositIntent = async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Valid amount is required' });
        }

        // Stripe requires amount in cents (or smallest currency unit)
        const amountInCents = amount * 100;

        // Create a PaymentIntent with given amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: { userId: req.user.id },
            // In a real app, you can use automatic_payment_methods
            // automatic_payment_methods: { enabled: true },
        });

        // Pre-save a 'pending' transaction in DB
        const transaction = await Transaction.create({
            user: req.user.id,
            amount: amount, // Storing in dollars for simplicity in DB read
            type: 'deposit',
            status: 'pending',
            stripePaymentIntentId: paymentIntent.id
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            transactionId: transaction._id
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc      Mock Withdraw API
// @route     POST /api/payments/withdraw
// @access    Private
exports.mockWithdraw = async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Valid amount is required' });
        }

        /* 
           Using a Mock setup. In production, you'd integrate Stripe Connect Payouts
           or transfer to a registered external bank account.
        */
        const transaction = await Transaction.create({
            user: req.user.id,
            amount: amount,
            type: 'withdraw',
            status: 'completed' // Assuming immediate success for mock
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal processed successfully (Mock)',
            data: transaction
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc      Mock Transfer API (User to User)
// @route     POST /api/payments/transfer
// @access    Private
exports.mockTransfer = async (req, res, next) => {
    try {
        const { amount, targetUserId } = req.body;

        if (!amount || amount <= 0 || !targetUserId) {
            return res.status(400).json({ success: false, error: 'Valid amount and target user ID are required' });
        }

        const transaction = await Transaction.create({
            user: req.user.id, // Sender
            amount: amount,
            type: 'transfer',
            status: 'completed' 
        });

        res.status(200).json({
            success: true,
            message: `Transfer of $${amount} to user ${targetUserId} processed successfully (Mock)`,
            data: transaction
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc      Get User Transction History
// @route     GET /api/payments/history
// @access    Private
exports.getTransactionHistory = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
