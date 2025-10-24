const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


// --- User Registration Function ---
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check if a user with this email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. If user doesn't exist, create a new user instance
        user = new User({
            name,
            email,
            password
        });

        // 3. Hash the password before saving it to the database
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Save the new user to the database
        await user.save();

        // 5. Create a JSON Web Token (JWT) for the new user
        const payload = {
            user: {
                id: user.id, // The user's unique ID from the database
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from the .env file
            { expiresIn: '5h' }, // The token will expire in 5 hours
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token }); // Send the token back to the client
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- User Login Function ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if a user with the provided email exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare the submitted password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. If credentials are correct, create and return a JWT
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- Get Logged In User's Data Function ---
// This function is for protected routes. It finds the user by the ID
// that the authMiddleware extracts from the token.
exports.getLoggedInUser = async (req, res) => {
    try {
        // 1. Fetch the user's base profile, converting it to a plain object
        const user = await User.findById(req.user.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 2. Find the most recent log entry for this user
        const latestLog = await DailyLog.findOne({ user: req.user.id }).sort({ date: -1 });

        // 3. If a recent log exists, update the user object's weight with the latest one
        if (latestLog) {
            user.weight = latestLog.weight;
        }

        // 4. Send the potentially modified user object to the frontend
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- NEW FUNCTION: Forgot Password ---
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            // For security, we don't reveal if an email is registered or not.
            // We send a success message either way to prevent user enumeration.
            return res.status(200).json({ success: true, data: 'Email sent' });
        }

        // Get the unhashed reset token from the user model method.
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // This URL MUST point to your live frontend on Vercel in production.
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        //console.log(resetUrl)

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please click this link to reset your password. The link is valid for 10 minutes.</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        // Clear tokens on error to prevent bad state.
        const user = await User.findOne({ email: req.body.email });
        if(user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).send('Server Error');
    }
};

// --- NEW FUNCTION: Reset Password ---
exports.resetPassword = async (req, res) => {
    try {
        // Hash the token from the URL to match the hashed version stored in the database.
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        // Find the user by the hashed token and check that the token has not expired.
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, data: 'Invalid or expired token' });
        }

        // Set the new password, hash it, and clear the reset token fields.
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, data: 'Password reset successful' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};