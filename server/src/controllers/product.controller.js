const ProductModel = require('../models/product.model');
const { sendSuccess, sendError } = require('../utils/response');
const { validateProductInput } = require('../utils/validators');

const ProductController = {
  async getAllProducts(req, res, next) {
    try {
      const { category, minDiscount, maxPrice, search, locality } = req.query;
      const products = await ProductModel.findAll({
        category,
        minDiscount,
        maxPrice,
        search,
        locality,
        status: 'available',
      });

      return sendSuccess(res, products, `Found ${products.length} surplus product(s).`);
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        return sendError(res, 'Product not found or has been removed.', 404);
      }

      return sendSuccess(res, product, 'Product details fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const sellerId = req.user.id;
      const body = { ...req.body };

      // If an image file was uploaded via multer
      if (req.file) {
        body.image_url = `/uploads/${req.file.filename}`;
      }

      // Convert numerical inputs
      body.original_price = Number(body.original_price);
      body.discounted_price = Number(body.discounted_price);
      body.quantity = Number(body.quantity);

      const validation = validateProductInput(body);
      if (!validation.isValid) {
        return sendError(res, validation.errors.join(' '), 400);
      }

      const productId = await ProductModel.create({
        seller_id: sellerId,
        name: body.name.trim(),
        category: body.category.trim(),
        description: body.description ? body.description.trim() : '',
        image_url: body.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        original_price: body.original_price,
        discounted_price: body.discounted_price,
        quantity: body.quantity,
        unit: body.unit || 'item',
        pickup_location: body.pickup_location.trim(),
        pickup_start: body.pickup_start || null,
        pickup_end: body.pickup_end,
        expiry_date: body.expiry_date || null,
        is_eligible_for_donation: body.is_eligible_for_donation ? 1 : 0,
        safety_notes: body.safety_notes || null,
      });

      const newProduct = await ProductModel.findById(productId);

      return sendSuccess(res, newProduct, 'Surplus product listed successfully!', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const sellerId = req.user.id;
      const updateData = { ...req.body };

      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
      }

      if (updateData.original_price) updateData.original_price = Number(updateData.original_price);
      if (updateData.discounted_price) updateData.discounted_price = Number(updateData.discounted_price);
      if (updateData.quantity) updateData.quantity = Number(updateData.quantity);

      const affected = await ProductModel.update(id, sellerId, updateData);
      if (affected === 0) {
        return sendError(res, 'Product not found or unauthorised to edit.', 404);
      }

      const updated = await ProductModel.findById(id);
      return sendSuccess(res, updated, 'Product listing updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const sellerId = req.user.id;

      const affected = await ProductModel.delete(id, sellerId);
      if (affected === 0) {
        return sendError(res, 'Product not found or unauthorised to delete.', 404);
      }

      return sendSuccess(res, { id }, 'Product listing removed.');
    } catch (err) {
      next(err);
    }
  },

  async getMyProducts(req, res, next) {
    try {
      const sellerId = req.user.id;
      const products = await ProductModel.findBySellerId(sellerId);
      return sendSuccess(res, products, `Retrieved ${products.length} product(s).`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProductController;
