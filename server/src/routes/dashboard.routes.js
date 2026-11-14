const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public impact metrics (Home page & Impact page)
router.get('/impact', DashboardController.getImpact);

// Role-specific dashboards
router.get('/seller', authenticateToken, requireRole('seller'), DashboardController.getSellerDashboard);
router.get('/customer', authenticateToken, requireRole('customer'), DashboardController.getCustomerDashboard);
router.get('/ngo', authenticateToken, requireRole('ngo'), DashboardController.getNgoDashboard);

module.exports = router;
