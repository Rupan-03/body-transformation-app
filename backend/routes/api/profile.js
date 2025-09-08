const express = require('express');
const router = express.Router();
const { updateUserProfile, deleteUserAccount} = require('../../controllers/profileController');
const authMiddleware = require('../../middleware/authMiddleware');

router.put('/', authMiddleware, updateUserProfile);

router.delete('/', authMiddleware, deleteUserAccount);

module.exports = router;