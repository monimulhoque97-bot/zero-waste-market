const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');
const { isValidEmail, isValidPassword } = require('../utils/validators');
const { JWT_SECRET } = require('../middleware/auth.middleware');

const AuthController = {
  async register(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role = 'customer',
        phone,
        // Seller specific fields
        business_name,
        business_address,
        locality,
        business_type,
        fssai_license,
        // NGO specific fields
        org_name,
        registration_number,
        cause_area,
        contact_person,
        website,
      } = req.body;

      // Validation
      if (!name || !name.trim()) {
        return sendError(res, 'Full name is required.', 400);
      }
      if (!isValidEmail(email)) {
        return sendError(res, 'A valid email address is required.', 400);
      }
      if (!isValidPassword(password)) {
        return sendError(res, 'Password must be at least 6 characters long.', 400);
      }

      const validRoles = ['customer', 'seller', 'ngo'];
      if (!validRoles.includes(role)) {
        return sendError(res, `Invalid role. Allowed roles: ${validRoles.join(', ')}`, 400);
      }

      // Check if email already registered
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return sendError(res, 'An account with this email address already exists.', 409);
      }

      // Hash password securely with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create base user record
      const userId = await UserModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        role,
        phone: phone ? phone.trim() : null,
      });

      // Role specific profile creation
      if (role === 'seller') {
        if (!business_name || !business_address) {
          return sendError(res, 'Business name and business address are required for sellers.', 400);
        }
        await UserModel.createSellerProfile({
          user_id: userId,
          business_name: business_name.trim(),
          business_address: business_address.trim(),
          locality: locality || 'Guwahati Central',
          business_type: business_type || 'Retail & Food',
          fssai_license: fssai_license || null,
        });
      } else if (role === 'ngo') {
        if (!org_name || !registration_number) {
          return sendError(res, 'Organisation name and registration number are required for NGOs.', 400);
        }
        await UserModel.createNgoProfile({
          user_id: userId,
          org_name: org_name.trim(),
          registration_number: registration_number.trim(),
          cause_area: cause_area || 'Food Relief & Community Support',
          address: business_address || 'Guwahati, Assam',
          contact_person: contact_person || name,
          website: website || null,
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: userId, email: email.trim().toLowerCase(), role, name: name.trim() },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const createdUser = await UserModel.findById(userId);

      return sendSuccess(
        res,
        {
          token,
          user: createdUser,
        },
        'Registration successful! Welcome to ZeroWaste Market.',
        201
      );
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required.', 400);
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return sendError(res, 'Invalid email or password credentials.', 401);
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password credentials.', 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userProfile = await UserModel.findById(user.id);

      return sendSuccess(
        res,
        {
          token,
          user: userProfile,
        },
        `Welcome back, ${user.name}!`
      );
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return sendError(res, 'User profile not found.', 404);
      }
      return sendSuccess(res, user, 'Profile retrieved successfully.');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
