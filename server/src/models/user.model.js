const db = require('../config/database');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.created_at,
              sp.business_name, sp.business_address, sp.locality, sp.business_type, sp.fssai_license,
              np.org_name, np.registration_number, np.verification_status, np.cause_area, np.website
       FROM users u
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id
       LEFT JOIN ngo_profiles np ON u.id = np.user_id
       WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password_hash, role, phone, avatar_url }) {
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), password_hash, role, phone || null, avatar_url || null]
    );
    return result.insertId;
  },

  async createSellerProfile({ user_id, business_name, business_address, locality, city, state, pin_code, business_type, fssai_license }) {
    const [result] = await db.query(
      `INSERT INTO seller_profiles (user_id, business_name, business_address, locality, city, state, pin_code, business_type, fssai_license)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        business_name,
        business_address,
        locality || 'Guwahati Central',
        city || 'Guwahati',
        state || 'Assam',
        pin_code || '781005',
        business_type || 'General Retail',
        fssai_license || null,
      ]
    );
    return result.insertId;
  },

  async createNgoProfile({ user_id, org_name, registration_number, cause_area, address, contact_person, website }) {
    const [result] = await db.query(
      `INSERT INTO ngo_profiles (user_id, org_name, registration_number, verification_status, cause_area, address, contact_person, website)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [user_id, org_name, registration_number, cause_area, address, contact_person, website || null]
    );
    return result.insertId;
  },

  async getSellerProfile(userId) {
    const [rows] = await db.query('SELECT * FROM seller_profiles WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  },

  async getNgoProfile(userId) {
    const [rows] = await db.query('SELECT * FROM ngo_profiles WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  },

  async updateNgoStatus(userId, status) {
    await db.query('UPDATE ngo_profiles SET verification_status = ? WHERE user_id = ?', [status, userId]);
  },
};

module.exports = UserModel;
