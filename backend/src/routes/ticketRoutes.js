const express = require('express');
const router = express.Router();
const {
    createTicket,
    getTickets,
    getTicketByPublicId,
    addFollowUp,
    getStats,
    reassignTicket,
    archiveTicket,
    deleteTicket
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Public inquiry
router.get('/public/:id', getTicketByPublicId);

// Private routes (Gestor/Admin)
router.post('/', protect, upload.array('photos', 3), createTicket);
router.get('/', protect, getTickets);
router.post('/:id/follow-up', protect, addFollowUp);
router.get('/stats', protect, getStats);
router.put('/:id/reassign', protect, reassignTicket);
router.put('/:id/archive', protect, archiveTicket);
router.delete('/:id', protect, deleteTicket);

module.exports = router;
