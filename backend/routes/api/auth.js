const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
  forgotPassword,
  resetPassword,
  logoutUser, // added
} = require('../../controllers/authController');
const authMiddleware = require('../../middleware/authMiddleware');

// register
router.post('/register', registerUser);

// login
router.post('/login', loginUser);

// logout
router.post('/logout', logoutUser);

// get logged in user (protected)
router.get('/user', authMiddleware, getLoggedInUser);

// password reset flows
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
