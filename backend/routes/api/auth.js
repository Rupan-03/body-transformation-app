const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getLoggedInUser, forgotPassword, resetPassword } = require('../../controllers/authController');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
router.post('/login', loginUser);

// @route   GET api/auth/user
// @desc    Get logged in user's data
// @access  Private (notice the authMiddleware is used here)
router.get('/user', authMiddleware, getLoggedInUser);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);


module.exports = router;