const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token
  });
};

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'This email is already registered. Please login instead.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate 2FA Mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash it and save in DB
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.twoFactorToken = hashedOtp;
    user.twoFactorExpire = Date.now() + 10 * 60 * 1000; // 10 minutes logic
    await user.save({ validateBeforeSave: false });

    // Try to send email (in a real app, wrap in try/catch to reset tokens on fail)
    try {
        await sendEmail({
            email: user.email,
            subject: 'Nexus Application Data: 2FA Token',
            message: `Your Nexus 2FA OTP is: ${otp}. It will expire in 10 minutes.`
        });
    } catch(err) {
        console.log("Email mock simulated fail, logging OTP instead:", otp);
    }

    // Require OTP step instead of sending JWT immediately
    res.status(200).json({ 
        success: true, 
        message: 'OTP Sent to Email. Call /api/auth/verify-otp to retrieve JWT.' 
    });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update user details (bio, profileDetails)
// @route     PUT /api/auth/updatedetails
// @access    Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      profileDetails: req.body.profileDetails,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Verify OTP and return JWT
// @route     POST /api/auth/verify-otp
// @access    Public
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Provide email and OTP' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Find user by email, token, and check if not expired
        const user = await User.findOne({
            email,
            twoFactorToken: hashedOtp,
            twoFactorExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // OTP Valid - wipe OTP fields
        user.twoFactorToken = undefined;
        user.twoFactorExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // Finally return JWT token to log the user in natively
        sendTokenResponse(user, 200, res);

    } catch(err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
