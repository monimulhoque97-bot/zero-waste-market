const db = require('../config/database');

const DonationModel = {
  async findAll({ status, category, sellerId, ngoId } = {}) {
    let sql = `
      SELECT d.*,
             u_s.name as seller_name, u_s.phone as seller_phone,
             sp.business_name, sp.business_address, sp.locality, sp.city,
             u_ngo.name as ngo_contact_name,
             np.org_name, np.verification_status, np.cause_area
      FROM donations d
      JOIN users u_s ON d.seller_id = u_s.id
      JOIN seller_profiles sp ON u_s.id = sp.user_id
      LEFT JOIN users u_ngo ON d.ngo_id = u_ngo.id
      LEFT JOIN ngo_profiles np ON u_ngo.id = np.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND d.status = ?';
      params.push(status);
    }

    if (category && category !== 'all' && category !== 'All') {
      sql += ' AND d.category = ?';
      params.push(category);
    }

    if (sellerId) {
      sql += ' AND d.seller_id = ?';
      params.push(sellerId);
    }

    if (ngoId) {
      sql += ' AND d.ngo_id = ?';
      params.push(ngoId);
    }

    sql += ' ORDER BY d.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findById(id) {
    const sql = `
      SELECT d.*,
             u_s.name as seller_name, u_s.email as seller_email, u_s.phone as seller_phone,
             sp.business_name, sp.business_address, sp.locality, sp.city, sp.fssai_license,
             u_ngo.name as ngo_contact_name, u_ngo.email as ngo_email, u_ngo.phone as ngo_phone,
             np.org_name, np.verification_status, np.cause_area, np.address as ngo_address
      FROM donations d
      JOIN users u_s ON d.seller_id = u_s.id
      JOIN seller_profiles sp ON u_s.id = sp.user_id
      LEFT JOIN users u_ngo ON d.ngo_id = u_ngo.id
      LEFT JOIN ngo_profiles np ON u_ngo.id = np.user_id
      WHERE d.id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async create({
    seller_id,
    product_id,
    title,
    category,
    description,
    quantity,
    unit = 'pack',
    expiry_date,
    pickup_location,
    pickup_deadline,
    safety_certification_acknowledged = 1,
  }) {
    const [res] = await db.query(
      `INSERT INTO donations (
        seller_id, product_id, title, category, description,
        quantity, unit, expiry_date, pickup_location, pickup_deadline,
        status, safety_certification_acknowledged
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)`,
      [
        seller_id,
        product_id || null,
        title,
        category,
        description || null,
        quantity,
        unit,
        expiry_date,
        pickup_location,
        pickup_deadline,
        safety_certification_acknowledged ? 1 : 0,
      ]
    );
    return res.insertId;
  },

  async requestDonation(id, ngoId, notes) {
    const [rows] = await db.query('SELECT status FROM donations WHERE id = ?', [id]);
    const donation = rows[0];
    if (!donation) throw new Error('Donation listing not found.');
    if (donation.status !== 'available') {
      throw new Error(`This donation is currently '${donation.status}' and cannot be requested.`);
    }

    const [res] = await db.query(
      `UPDATE donations
       SET ngo_id = ?, status = 'requested', request_notes = ?
       WHERE id = ? AND status = 'available'`,
      [ngoId, notes || null, id]
    );
    return res.affectedRows;
  },

  async updateStatus(id, sellerId, newStatus) {
    const [rows] = await db.query('SELECT seller_id, status FROM donations WHERE id = ?', [id]);
    const donation = rows[0];
    if (!donation) throw new Error('Donation listing not found.');
    if (donation.seller_id !== sellerId) {
      throw new Error('Unauthorised: Only the listing seller can modify this donation status.');
    }

    const [res] = await db.query('UPDATE donations SET status = ? WHERE id = ?', [newStatus, id]);
    return res.affectedRows;
  },
};

module.exports = DonationModel;
