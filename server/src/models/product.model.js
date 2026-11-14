const db = require('../config/database');

const ProductModel = {
  async findAll({ category, minDiscount, maxPrice, search, status = 'available', locality, sellerId } = {}) {
    let sql = `
      SELECT p.*,
             sp.business_name, sp.business_address, sp.locality, sp.city, sp.fssai_license,
             ROUND(((p.original_price - p.discounted_price) / p.original_price) * 100) AS discount_percentage
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN seller_profiles sp ON u.id = sp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (sellerId) {
      sql += ' AND p.seller_id = ?';
      params.push(sellerId);
    }

    if (category && category !== 'All' && category !== 'all') {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (locality) {
      sql += ' AND sp.locality LIKE ?';
      params.push(`%${locality}%`);
    }

    if (maxPrice && !isNaN(maxPrice)) {
      sql += ' AND p.discounted_price <= ?';
      params.push(Number(maxPrice));
    }

    if (search && search.trim()) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR sp.business_name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Only show items with positive quantity unless filtering seller's own listings
    if (!sellerId) {
      sql += ' AND p.quantity > 0';
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(sql, params);

    // Filter minDiscount in application layer or SQL
    if (minDiscount && !isNaN(minDiscount)) {
      const minD = Number(minDiscount);
      return rows.filter((r) => Number(r.discount_percentage) >= minD);
    }

    return rows;
  },

  async findById(id) {
    const sql = `
      SELECT p.*,
             u.name as seller_contact_name, u.email as seller_email, u.phone as seller_phone,
             sp.business_name, sp.business_address, sp.locality, sp.city, sp.state, sp.pin_code,
             sp.business_type, sp.fssai_license,
             ROUND(((p.original_price - p.discounted_price) / p.original_price) * 100) AS discount_percentage
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN seller_profiles sp ON u.id = sp.user_id
      WHERE p.id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async findBySellerId(sellerId) {
    const sql = `
      SELECT p.*,
             ROUND(((p.original_price - p.discounted_price) / p.original_price) * 100) AS discount_percentage,
             (SELECT COUNT(*) FROM reservations r WHERE r.product_id = p.id) as reservation_count
      FROM products p
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(sql, [sellerId]);
    return rows;
  },

  async create({
    seller_id,
    name,
    category,
    description,
    image_url,
    original_price,
    discounted_price,
    quantity,
    unit,
    pickup_location,
    pickup_start,
    pickup_end,
    expiry_date,
    status = 'available',
    is_eligible_for_donation = 0,
    safety_notes,
  }) {
    const [result] = await db.query(
      `INSERT INTO products (
        seller_id, name, category, description, image_url,
        original_price, discounted_price, quantity, unit,
        pickup_location, pickup_start, pickup_end, expiry_date,
        status, is_eligible_for_donation, safety_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seller_id,
        name,
        category,
        description || null,
        image_url || null,
        original_price,
        discounted_price,
        quantity,
        unit || 'item',
        pickup_location,
        pickup_start || null,
        pickup_end,
        expiry_date || null,
        status,
        is_eligible_for_donation ? 1 : 0,
        safety_notes || null,
      ]
    );
    return result.insertId;
  },

  async update(id, sellerId, updateData) {
    const fields = [];
    const params = [];

    const allowed = [
      'name', 'category', 'description', 'image_url', 'original_price',
      'discounted_price', 'quantity', 'unit', 'pickup_location',
      'pickup_start', 'pickup_end', 'expiry_date', 'status',
      'is_eligible_for_donation', 'safety_notes',
    ];

    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    }

    if (fields.length === 0) return 0;

    params.push(id, sellerId);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND seller_id = ?`;
    const [res] = await db.query(sql, params);
    return res.affectedRows;
  },

  async delete(id, sellerId) {
    const [res] = await db.query('DELETE FROM products WHERE id = ? AND seller_id = ?', [id, sellerId]);
    return res.affectedRows;
  },

  async updateQuantity(id, quantityDiff, conn = null) {
    const executor = conn ? conn : db;
    const [res] = await executor.query(
      'UPDATE products SET quantity = quantity + ? WHERE id = ? AND quantity + ? >= 0',
      [quantityDiff, id, quantityDiff]
    );
    return res.affectedRows;
  },
};

module.exports = ProductModel;
