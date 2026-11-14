const express = require('express');
const router = express.Router();
const AiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// AI Surplus Listing Assistant (supports text + optional image)
router.post(
  '/analyze-listing',
  authenticateToken,
  requireRole('seller'),
  upload.single('image'),
  AiController.analyzeListing
);

// AI Listing Quality Checker
router.post(
  '/check-listing',
  authenticateToken,
  requireRole('seller'),
  AiController.checkListing
);

module.exports = router;
