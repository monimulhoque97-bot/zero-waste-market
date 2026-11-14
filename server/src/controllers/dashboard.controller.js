const ImpactService = require('../services/impact.service');
const ProductModel = require('../models/product.model');
const ReservationModel = require('../models/reservation.model');
const DonationModel = require('../models/donation.model');
const UserModel = require('../models/user.model');
const { sendSuccess } = require('../utils/response');

const DashboardController = {
  async getSellerDashboard(req, res, next) {
    try {
      const sellerId = req.user.id;

      const [impact, products, reservations, donations, profile] = await Promise.all([
        ImpactService.getSellerImpact(sellerId),
        ProductModel.findBySellerId(sellerId),
        ReservationModel.findBySellerId(sellerId),
        DonationModel.findAll({ sellerId }),
        UserModel.getSellerProfile(sellerId),
      ]);

      const activeReservations = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');
      const pendingDonations = donations.filter((d) => d.status === 'requested');

      return sendSuccess(res, {
        profile,
        stats: {
          total_products: products.length,
          active_listings: products.filter((p) => p.status === 'available').length,
          active_reservations: activeReservations.length,
          pending_donation_requests: pendingDonations.length,
          total_units_sold: impact.total_units_sold,
          total_units_donated: impact.total_units_donated,
          total_revenue_inr: impact.total_revenue_inr,
          waste_avoided_kg: impact.waste_avoided_kg,
          co2_avoided_kg: impact.co2_avoided_kg,
        },
        recent_reservations: reservations.slice(0, 5),
        recent_listings: products.slice(0, 5),
        recent_donations: donations.slice(0, 5),
      });
    } catch (err) {
      next(err);
    }
  },

  async getCustomerDashboard(req, res, next) {
    try {
      const customerId = req.user.id;

      const [impact, reservations] = await Promise.all([
        ImpactService.getCustomerImpact(customerId),
        ReservationModel.findByCustomerId(customerId),
      ]);

      const upcomingPickups = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');

      return sendSuccess(res, {
        stats: impact,
        upcoming_pickups: upcomingPickups,
        recent_reservations: reservations.slice(0, 5),
      });
    } catch (err) {
      next(err);
    }
  },

  async getNgoDashboard(req, res, next) {
    try {
      const ngoId = req.user.id;

      const [impact, profile, allDonations, myRequests] = await Promise.all([
        ImpactService.getNgoImpact(ngoId),
        UserModel.getNgoProfile(ngoId),
        DonationModel.findAll({ status: 'available' }),
        DonationModel.findAll({ ngoId }),
      ]);

      return sendSuccess(res, {
        profile,
        stats: impact,
        available_donations_count: allDonations.length,
        available_donations: allDonations.slice(0, 6),
        my_requests: myRequests,
      });
    } catch (err) {
      next(err);
    }
  },

  async getImpact(req, res, next) {
    try {
      const impactData = await ImpactService.getGlobalImpact();
      return sendSuccess(res, impactData, 'Global impact statistics retrieved.');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DashboardController;
