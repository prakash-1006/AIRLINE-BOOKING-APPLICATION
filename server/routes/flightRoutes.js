const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/', flightController.searchFlights);
router.get('/:id', flightController.getFlightDetails);

// Admin only routes can be added here later (e.g., POST, PUT, DELETE flights)

module.exports = router;
