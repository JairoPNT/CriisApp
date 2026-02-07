const express = require('express');
const router = express.Router();
const { login, updateProfile, getUsers, updateUser, seedUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/seed', seedUsers);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, getUsers);
router.put('/users/:id', protect, updateUser);

module.exports = router;
