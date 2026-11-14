const ReservationModel = require('../models/reservation.model');
const NotificationModel = require('../models/notification.model');
const ProductModel = require('../models/product.model');
const { sendSuccess, sendError } = require('../utils/response');
const { isValidQuantity } = require('../utils/validators');

const ReservationController = {
  async createReservation(req, res, next) {
    try {
      const customerId = req.user.id;
      const { product_id, quantity = 1, notes } = req.body;

      if (!product_id) {
        return sendError(res, 'Product ID is required to create a reservation.', 400);
      }

      if (!isValidQuantity(quantity)) {
        return sendError(res, 'Quantity must be a positive whole integer.', 400);
      }

      // Execute safe database transaction
      const reservation = await ReservationModel.createReservationTransaction({
        customer_id: customerId,
        product_id: Number(product_id),
        quantity: Number(quantity),
        notes,
      });

      // Notify seller
      const product = await ProductModel.findById(product_id);
      if (product) {
        await NotificationModel.create({
          user_id: product.seller_id,
          title: 'New Customer Reservation',
          message: `Customer reserved ${quantity}x "${product.name}". Pickup Code: ${reservation.pickup_code}.`,
          type: 'reservation',
        });
      }

      return sendSuccess(
        res,
        reservation,
        `Reservation confirmed! Show pickup code "${reservation.pickup_code}" at collection counter.`,
        201
      );
    } catch (err) {
      // Catch inventory errors
      if (err.message && err.message.includes('Insufficient inventory')) {
        return sendError(res, err.message, 409);
      }
      next(err);
    }
  },

  async getCustomerReservations(req, res, next) {
    try {
      const customerId = req.user.id;
      const reservations = await ReservationModel.findByCustomerId(customerId);
      return sendSuccess(res, reservations, `Found ${reservations.length} reservation(s).`);
    } catch (err) {
      next(err);
    }
  },

  async getSellerReservations(req, res, next) {
    try {
      const sellerId = req.user.id;
      const reservations = await ReservationModel.findBySellerId(sellerId);
      return sendSuccess(res, reservations, `Found ${reservations.length} customer order(s).`);
    } catch (err) {
      next(err);
    }
  },

  async cancelReservation(req, res, next) {
    try {
      const customerId = req.user.id;
      const { id } = req.params;

      await ReservationModel.cancelReservation(id, customerId);

      return sendSuccess(res, { id, status: 'cancelled' }, 'Reservation cancelled successfully. Product stock restored.');
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async updateReservationStatus(req, res, next) {
    try {
      const sellerId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      await ReservationModel.updateStatusBySeller(id, sellerId, status);

      // Notify customer if completed
      const reservation = await ReservationModel.findById(id);
      if (reservation && status === 'completed') {
        await NotificationModel.create({
          user_id: reservation.customer_id,
          title: 'Order Handover Complete',
          message: `Your pickup for "${reservation.product_name}" was confirmed. Thank you for reducing waste!`,
          type: 'reservation',
        });
      }

      return sendSuccess(res, { id, status }, `Reservation marked as '${status}'.`);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },
};

module.exports = ReservationController;
