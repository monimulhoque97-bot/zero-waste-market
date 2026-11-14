const DonationModel = require('../models/donation.model');
const UserModel = require('../models/user.model');
const NotificationModel = require('../models/notification.model');
const { sendSuccess, sendError } = require('../utils/response');
const { validateDonationInput } = require('../utils/validators');

const DonationController = {
  async getDonations(req, res, next) {
    try {
      const { status, category, sellerId, ngoId } = req.query;
      const donations = await DonationModel.findAll({ status, category, sellerId, ngoId });
      return sendSuccess(res, donations, `Found ${donations.length} donation listing(s).`);
    } catch (err) {
      next(err);
    }
  },

  async getDonationById(req, res, next) {
    try {
      const { id } = req.params;
      const donation = await DonationModel.findById(id);
      if (!donation) {
        return sendError(res, 'Donation listing not found.', 404);
      }
      return sendSuccess(res, donation, 'Donation details fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  async createDonation(req, res, next) {
    try {
      const sellerId = req.user.id;
      const body = { ...req.body };
      body.quantity = Number(body.quantity);

      const validation = validateDonationInput(body);
      if (!validation.isValid) {
        return sendError(res, validation.errors.join(' '), 400);
      }

      const donationId = await DonationModel.create({
        seller_id: sellerId,
        product_id: body.product_id ? Number(body.product_id) : null,
        title: body.title.trim(),
        category: body.category.trim(),
        description: body.description ? body.description.trim() : '',
        quantity: body.quantity,
        unit: body.unit || 'pack',
        expiry_date: body.expiry_date,
        pickup_location: body.pickup_location.trim(),
        pickup_deadline: body.pickup_deadline,
        safety_certification_acknowledged: body.safety_certification_acknowledged !== false,
      });

      const newDonation = await DonationModel.findById(donationId);
      return sendSuccess(res, newDonation, 'Surplus donation listed for verified NGOs!', 201);
    } catch (err) {
      next(err);
    }
  },

  async requestDonation(req, res, next) {
    try {
      const ngoId = req.user.id;
      const { id } = req.params;
      const { notes } = req.body;

      // Check NGO verification status! Prompt requirement: "Do not represent an unverified NGO as a verified organisation."
      const ngoProfile = await UserModel.getNgoProfile(ngoId);
      if (!ngoProfile) {
        return sendError(res, 'NGO profile not found. Please complete organisation registration.', 403);
      }

      if (ngoProfile.verification_status !== 'verified') {
        return sendError(
          res,
          `NGO verification status is currently '${ngoProfile.verification_status}'. Only verified organisations can claim surplus food donations under food safety guidelines.`,
          403
        );
      }

      await DonationModel.requestDonation(id, ngoId, notes);

      // Notify seller
      const donation = await DonationModel.findById(id);
      if (donation) {
        await NotificationModel.create({
          user_id: donation.seller_id,
          title: 'Donation Request Received',
          message: `Verified NGO "${ngoProfile.org_name}" requested donation: "${donation.title}".`,
          type: 'donation',
        });
      }

      return sendSuccess(res, { id, status: 'requested' }, 'Donation request submitted! Awaiting seller pickup confirmation.');
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  async updateDonationStatus(req, res, next) {
    try {
      const sellerId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['available', 'requested', 'accepted', 'completed', 'rejected', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return sendError(res, `Invalid donation status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      await DonationModel.updateStatus(id, sellerId, status);

      // Notify NGO if requested donation status changes
      const donation = await DonationModel.findById(id);
      if (donation && donation.ngo_id) {
        await NotificationModel.create({
          user_id: donation.ngo_id,
          title: `Donation Request ${status.toUpperCase()}`,
          message: `Seller marked donation "${donation.title}" as ${status}.`,
          type: 'donation',
        });
      }

      return sendSuccess(res, { id, status }, `Donation status updated to '${status}'.`);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },
};

module.exports = DonationController;
