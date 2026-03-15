const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, bookingController.createBooking);
router.get('/:userId', auth, bookingController.getUserBookings);
router.delete('/:id', auth, bookingController.cancelBooking);

module.exports = router;
