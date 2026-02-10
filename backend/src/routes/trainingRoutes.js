const express = require('express');
const router = express.Router();
const {
    getAvailability,
    bookTraining,
    getAllTrainings,
    deleteTraining,
    getBusySchedule,
    getAvailableTimeSlots,
    getManagers,
    updateTrainingProgress
} = require('../controllers/trainingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/availability', getAvailability);
router.get('/slots', getAvailableTimeSlots);
router.get('/managers', getManagers);
router.post('/book', bookTraining);

router.get('/schedule', getBusySchedule);

// Protected routes
router.get('/', protect, getAllTrainings);
router.put('/progress/:id', protect, updateTrainingProgress);
router.delete('/:id', protect, deleteTraining);

module.exports = router;
