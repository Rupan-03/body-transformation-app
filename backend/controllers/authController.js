// controllers/authController.js
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// helper: create token, set cookie, respond with user (without password)
const sendToken = (user, statusCode, res) => {
  const payload = { id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '5h',
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() +
        (process.env.COOKIE_EXPIRE_MS
          ? parseInt(process.env.COOKIE_EXPIRE_MS)
          : 5 * 60 * 60 * 1000)
    ),
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('token', token, cookieOptions);

  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return res.status(statusCode).json({ success: true, token, user: userObj });
};

// --- User Registration Function ---
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    return sendToken(user, 201, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// --- User Login Function ---
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    return sendToken(user, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// --- Get Logged In User's Data Function ---
exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const latestLog = await DailyLog.findOne({ user: req.user.id }).sort({
      date: -1,
    });
    if (latestLog) user.weight = latestLog.weight;

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Forgot Password (Reset Link, No OTP) ---
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Prevent revealing user existence
      return res.status(200).json({ success: true, data: 'Email sent' });
    }

    // Generate and save token with 10 min expiry
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL (frontend)
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // HTML email template with clickable button
    const html = `
        <!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <title>Password Reset</title>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: 'Open Sans', sans-serif;
              background-color: #F6FAFB;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 500px;
              margin: 50px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              padding: 40px;
            }
            .title {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #000000;
            }
            .text {
              font-size: 15px;
              color: #333333;
              margin-bottom: 20px;
              line-height: 1.6;
            }
            .footer {
              font-size: 13px;
              color: #888888;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">Password Reset Request</div>
            <div class="text">
              We received a password reset request for your account:
              <strong>${user.email}</strong>.
            </div>
            <div class="text">
              Click the button below to reset your password. This link will expire in
              <strong>10 minutes</strong>.
            </div>

            <a href="${resetUrl}"
              style="
                background-color: #22D172;
                color: #FFFFFF !important;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 6px;
                font-weight: bold;
                display: inline-block;
                text-align: center;
                font-family: 'Open Sans', sans-serif;
              ">
              Reset Password
            </a>

            <div class="footer">
              If you didn’t request this, you can safely ignore this email.
            </div>
          </div>
        </body>
        </html>
        `;


    // Send the email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - BodyTrack App',
      html,
    });

    res.status(200).json({ success: true, data: 'Reset email sent successfully' });
  } catch (err) {
    console.error(err);
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).send('Server Error');
  }
};

// --- Reset Password ---
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, data: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, data: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// --- Logout User ---
exports.logoutUser = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  return res.status(200).json({ success: true, message: 'Logged out' });
};
