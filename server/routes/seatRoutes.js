const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

router.get('/:flightId', seatController.getSeatsByFlight);

// Endpoint to hold a seat temporarily during booking process
router.post('/hold', seatController.holdSeat);

module.exports = router;
