const db = require('../config/database');

const ReservationModel = {
  /**
   * Create reservation with Database Transaction to prevent race conditions & overselling
   */
  async createReservationTransaction({ customer_id, product_id, quantity, notes }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Fetch current product and lock row (FOR UPDATE in MySQL)
      const isSqlite = db.getActiveEngine() === 'sqlite';
      const lockClause = isSqlite ? '' : 'FOR UPDATE';
      const [products] = await conn.query(
        `SELECT id, name, discounted_price, quantity, status FROM products WHERE id = ? ${lockClause}`,
        [product_id]
      );

      const product = products[0];
      if (!product) {
        throw new Error('Product not found or no longer available.');
      }

      if (product.status !== 'available' && product.status !== 'reserved') {
        throw new Error(`Product is currently ${product.status} and cannot be reserved.`);
      }

      if (product.quantity < quantity) {
        throw new Error(`Insufficient inventory. Only ${product.quantity} unit(s) remaining.`);
      }

      // 2. Calculate prices
      const unitPrice = Number(product.discounted_price);
      const totalPrice = Number((unitPrice * quantity).toFixed(2));

      // 3. Generate secure pickup verification code (e.g. ZW-GUW-8A29)
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const pickupCode = `ZW-GUW-${randomSuffix}`;

      // 4. Insert reservation record
      const [resResult] = await conn.query(
        `INSERT INTO reservations (customer_id, product_id, quantity, unit_price, total_price, status, pickup_code, notes)
         VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
        [customer_id, product_id, quantity, unitPrice, totalPrice, pickupCode, notes || null]
      );

      const reservationId = resResult.insertId;

      // 5. Deduct product inventory
      const newQuantity = product.quantity - quantity;
      const newStatus = newQuantity === 0 ? 'sold_out' : 'available';

      await conn.query(
        'UPDATE products SET quantity = ?, status = ? WHERE id = ?',
        [newQuantity, newStatus, product_id]
      );

      // Commit transaction
      await conn.commit();

      return {
        id: reservationId,
        pickup_code: pickupCode,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        status: 'confirmed',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findById(id) {
    const sql = `
      SELECT r.*,
             p.name as product_name, p.image_url, p.category, p.pickup_location, p.pickup_end, p.original_price,
             u_c.name as customer_name, u_c.email as customer_email, u_c.phone as customer_phone,
             u_s.id as seller_id, u_s.name as seller_name,
             sp.business_name, sp.business_address, sp.locality, sp.fssai_license
      FROM reservations r
      JOIN products p ON r.product_id = p.id
      JOIN users u_c ON r.customer_id = u_c.id
      JOIN users u_s ON p.seller_id = u_s.id
      JOIN seller_profiles sp ON u_s.id = sp.user_id
      WHERE r.id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async findByCustomerId(customerId) {
    const sql = `
      SELECT r.*,
             p.name as product_name, p.image_url, p.category, p.pickup_location, p.pickup_end, p.original_price,
             sp.business_name, sp.locality
      FROM reservations r
      JOIN products p ON r.product_id = p.id
      JOIN users u_s ON p.seller_id = u_s.id
      JOIN seller_profiles sp ON u_s.id = sp.user_id
      WHERE r.customer_id = ?
      ORDER BY r.reserved_at DESC
    `;
    const [rows] = await db.query(sql, [customerId]);
    return rows;
  },

  async findBySellerId(sellerId) {
    const sql = `
      SELECT r.*,
             p.name as product_name, p.image_url, p.category, p.pickup_location, p.pickup_end,
             u_c.name as customer_name, u_c.email as customer_email, u_c.phone as customer_phone
      FROM reservations r
      JOIN products p ON r.product_id = p.id
      JOIN users u_c ON r.customer_id = u_c.id
      WHERE p.seller_id = ?
      ORDER BY r.reserved_at DESC
    `;
    const [rows] = await db.query(sql, [sellerId]);
    return rows;
  },

  /**
   * Cancel reservation with stock restoration in transaction
   */
  async cancelReservation(id, customerId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [reservations] = await conn.query(
        'SELECT * FROM reservations WHERE id = ? AND customer_id = ?',
        [id, customerId]
      );
      const res = reservations[0];
      if (!res) {
        throw new Error('Reservation not found or unauthorised to cancel.');
      }

      if (res.status === 'completed') {
        throw new Error('Completed reservations cannot be cancelled.');
      }
      if (res.status === 'cancelled') {
        throw new Error('Reservation is already cancelled.');
      }

      // Update reservation status
      await conn.query('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', id]);

      // Restore inventory
      await conn.query(
        'UPDATE products SET quantity = quantity + ?, status = "available" WHERE id = ?',
        [res.quantity, res.product_id]
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateStatusBySeller(id, sellerId, newStatus) {
    // Check that reservation belongs to seller's product
    const [rows] = await db.query(
      `SELECT r.id, r.product_id, r.status
       FROM reservations r
       JOIN products p ON r.product_id = p.id
       WHERE r.id = ? AND p.seller_id = ?`,
      [id, sellerId]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Reservation not found or unauthorised.');
    }

    const completedAt = newStatus === 'completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    await db.query(
      'UPDATE reservations SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?',
      [newStatus, completedAt, id]
    );

    return true;
  },
};

module.exports = ReservationModel;
