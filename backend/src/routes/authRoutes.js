const express = require('express');
const router = express.Router();
const { login, updateProfile, getUsers, seedUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/seed', seedUsers);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, getUsers);

module.exports = router;
