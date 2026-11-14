const express = require('express');
const router = express.Router();
const DonationController = require('../controllers/donation.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public / NGO view eligible donation listings
router.get('/', DonationController.getDonations);
router.get('/:id', DonationController.getDonationById);

// Seller creates donation listing
router.post('/', authenticateToken, requireRole('seller'), DonationController.createDonation);

// Verified NGO requests donation
router.post('/:id/request', authenticateToken, requireRole('ngo'), DonationController.requestDonation);

// Seller updates donation status (accept, complete, reject)
router.patch('/:id/status', authenticateToken, requireRole('seller'), DonationController.updateDonationStatus);

module.exports = router;
