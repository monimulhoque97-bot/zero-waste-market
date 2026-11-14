const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Customer creates reservation
router.post('/', authenticateToken, requireRole('customer'), ReservationController.createReservation);

// Customer views reservation history
router.get('/my-reservations', authenticateToken, requireRole('customer'), ReservationController.getCustomerReservations);

// Seller views incoming orders
router.get('/seller', authenticateToken, requireRole('seller'), ReservationController.getSellerReservations);

// Customer cancels reservation
router.patch('/:id/cancel', authenticateToken, requireRole('customer'), ReservationController.cancelReservation);

// Seller updates order status (e.g. confirms pickup/handover)
router.patch('/:id/status', authenticateToken, requireRole('seller'), ReservationController.updateReservationStatus);

module.exports = router;
