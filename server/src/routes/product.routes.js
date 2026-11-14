const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Public listing browsing
router.get('/', ProductController.getAllProducts);

// Seller's own listings
router.get('/seller/my-products', authenticateToken, requireRole('seller'), ProductController.getMyProducts);

// Single product details
router.get('/:id', ProductController.getProductById);

// Seller add product (handles multipart image upload or JSON payload)
router.post('/', authenticateToken, requireRole('seller'), upload.single('image'), ProductController.createProduct);

// Seller update product
router.put('/:id', authenticateToken, requireRole('seller'), upload.single('image'), ProductController.updateProduct);

// Seller delete product
router.delete('/:id', authenticateToken, requireRole('seller'), ProductController.deleteProduct);

module.exports = router;
