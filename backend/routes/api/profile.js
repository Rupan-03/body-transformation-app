const express = require('express');
const router = express.Router();
const { updateUserProfile } = require('../../controllers/profileController');
const authMiddleware = require('../../middleware/authMiddleware');

router.put('/', authMiddleware, updateUserProfile);

module.exports = router;