const path = require('path');
const bcrypt = require(path.resolve(__dirname, '../server/node_modules/bcryptjs'));
const db = require('../server/src/config/database');

async function seed() {
  console.log('🌱 Starting ZeroWaste Market Database Seeder...');
  await db.initDatabase();
  console.log(`[Seeder] Connected using engine: ${db.getActiveEngine()}`);

  // Create tables if not exists
  console.log('[Seeder] Ensuring tables exist...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('seller', 'customer', 'ngo') NOT NULL,
      phone VARCHAR(20),
      avatar_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS seller_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      business_name VARCHAR(150) NOT NULL,
      business_address TEXT NOT NULL,
      locality VARCHAR(100) NOT NULL,
      city VARCHAR(50) DEFAULT 'Guwahati',
      state VARCHAR(50) DEFAULT 'Assam',
      pin_code VARCHAR(10) DEFAULT '781005',
      business_type VARCHAR(50) NOT NULL,
      fssai_license VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ngo_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      org_name VARCHAR(150) NOT NULL,
      registration_number VARCHAR(100) NOT NULL,
      verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
      cause_area VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      contact_person VARCHAR(100) NOT NULL,
      website VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      original_price DECIMAL(10, 2) NOT NULL,
      discounted_price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      unit VARCHAR(20) DEFAULT 'item',
      pickup_location TEXT NOT NULL,
      pickup_start DATETIME,
      pickup_end DATETIME NOT NULL,
      expiry_date DATE,
      status ENUM('available', 'reserved', 'sold_out', 'expired') DEFAULT 'available',
      is_eligible_for_donation BOOLEAN DEFAULT FALSE,
      safety_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
      pickup_code VARCHAR(30) NOT NULL,
      reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      notes TEXT
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT NOT NULL,
      product_id INT NULL,
      ngo_id INT NULL,
      title VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      quantity INT NOT NULL,
      unit VARCHAR(20) DEFAULT 'pack',
      expiry_date DATE NOT NULL,
      pickup_location TEXT NOT NULL,
      pickup_deadline DATETIME NOT NULL,
      status ENUM('available', 'requested', 'accepted', 'completed', 'rejected', 'cancelled') DEFAULT 'available',
      request_notes TEXT,
      safety_certification_acknowledged BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('reservation', 'donation', 'alert', 'system') DEFAULT 'system',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[Seeder] Checking existing users...');
  const [existing] = await db.query('SELECT COUNT(*) as count FROM users');
  const count = existing[0]?.count || 0;

  if (count > 0) {
    console.log(`[Seeder] Found ${count} existing users. Refreshing demo data...`);
    await db.query('DELETE FROM notifications');
    await db.query('DELETE FROM donations');
    await db.query('DELETE FROM reservations');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM ngo_profiles');
    await db.query('DELETE FROM seller_profiles');
    await db.query('DELETE FROM users');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  console.log('[Seeder] Inserting demo accounts (Password: Password123!)...');

  // 1. Seller: Brahmaputra Bakers (Priyanka Sarma)
  const [resSeller] = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, 'seller', ?)`,
    ['Priyanka Sarma', 'seller@zerowaste.in', passwordHash, '+91 98640 12345']
  );
  const sellerId = resSeller.insertId;

  await db.query(
    `INSERT INTO seller_profiles (user_id, business_name, business_address, locality, city, state, pin_code, business_type, fssai_license)
     VALUES (?, ?, ?, ?, 'Guwahati', 'Assam', '781005', 'Bakery & Confectionery', '10321999000123')`,
    [sellerId, 'Brahmaputra Bakers & Cafe', 'Shop 14, Central Mall Arcade, GS Road', 'Christian Basti']
  );

  // 2. Customer: Rahul Goswami
  const [resCustomer] = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, 'customer', ?)`,
    ['Rahul Goswami', 'customer@zerowaste.in', passwordHash, '+91 94350 98765']
  );
  const customerId = resCustomer.insertId;

  // 3. NGO: Assam Food Relief & Seva Trust (Anjali Baruah)
  const [resNgo] = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, 'ngo', ?)`,
    ['Anjali Baruah', 'ngo@zerowaste.in', passwordHash, '+91 91270 45678']
  );
  const ngoId = resNgo.insertId;

  await db.query(
    `INSERT INTO ngo_profiles (user_id, org_name, registration_number, verification_status, cause_area, address, contact_person, website)
     VALUES (?, ?, ?, 'verified', ?, ?, ?, ?)`,
    [
      ngoId,
      'Assam Food Relief & Seva Trust',
      'KAM-METRO-NGO-2019-4821',
      'Food Relief & Community Kitchens',
      'Sector 4, Zoo-Narengi Road, Guwahati',
      'Anjali Baruah (Director)',
      'https://assamfoodrelief.org',
    ]
  );

  // 4. Second Seller: Green Harvest Organics (Bhaskar Das)
  const [resSeller2] = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, 'seller', ?)`,
    ['Bhaskar Das', 'harvest@zerowaste.in', passwordHash, '+91 98641 55667']
  );
  const seller2Id = resSeller2.insertId;

  await db.query(
    `INSERT INTO seller_profiles (user_id, business_name, business_address, locality, city, state, pin_code, business_type, fssai_license)
     VALUES (?, ?, ?, ?, 'Guwahati', 'Assam', '781001', 'Produce & Organic Grocery', '10322888000456')`,
    [seller2Id, 'Green Harvest Organic Mart', 'Uzan Bazar Ghat Road, Near Brahmaputra View', 'Uzan Bazar']
  );

  // 5. Third Seller: Assam Sweet Treats & Dairy (Manasjyoti Kalita)
  const [resSeller3] = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, 'seller', ?)`,
    ['Manasjyoti Kalita', 'sweets@zerowaste.in', passwordHash, '+91 94351 22334']
  );
  const seller3Id = resSeller3.insertId;

  await db.query(
    `INSERT INTO seller_profiles (user_id, business_name, business_address, locality, city, state, pin_code, business_type, fssai_license)
     VALUES (?, ?, ?, ?, 'Guwahati', 'Assam', '781008', 'Traditional Dairy & Sweets', '10323777000789')`,
    [seller3Id, 'Assam Sweet Treats & Dairy', 'Station Road, Paltan Bazar', 'Paltan Bazar']
  );

  console.log('[Seeder] Inserting Guwahati surplus marketplace products...');

  const today = new Date();
  const todayEnd = new Date(today);
  todayEnd.setHours(21, 30, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);

  const in2Days = new Date(today);
  in2Days.setDate(in2Days.getDate() + 2);

  const [p1] = await db.query(
    `INSERT INTO products (seller_id, name, category, description, image_url, original_price, discounted_price, quantity, unit, pickup_location, pickup_start, pickup_end, expiry_date, status, is_eligible_for_donation, safety_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
    [
      sellerId,
      'Artisan Sourdough Loaves (Pack of 2)',
      'Bakery',
      'Freshly baked European style sourdough loaves. Baked this morning with organic wheat flour, crisp crust and airy crumb. Perfect for sandwiches and toasts.',
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      240.00,
      99.00,
      8,
      'pack',
      'Brahmaputra Bakers, GS Road, Christian Basti, Guwahati',
      today.toISOString().slice(0, 19).replace('T', ' '),
      todayEnd.toISOString().slice(0, 19).replace('T', ' '),
      tomorrow.toISOString().slice(0, 10),
      1,
      'Keep refrigerated or consume within 48 hours. Baked fresh daily.',
    ]
  );

  const [p2] = await db.query(
    `INSERT INTO products (seller_id, name, category, description, image_url, original_price, discounted_price, quantity, unit, pickup_location, pickup_start, pickup_end, expiry_date, status, is_eligible_for_donation, safety_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
    [
      sellerId,
      'Butter Croissant Box (Assorted 4 pcs)',
      'Bakery',
      'Golden, flaky French butter croissants filled with light chocolate and plain butter layers. Surplus afternoon batch.',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      280.00,
      120.00,
      5,
      'box',
      'Brahmaputra Bakers, GS Road, Christian Basti, Guwahati',
      today.toISOString().slice(0, 19).replace('T', ' '),
      todayEnd.toISOString().slice(0, 19).replace('T', ' '),
      tomorrow.toISOString().slice(0, 10),
      1,
      'Best enjoyed warmed. Contains dairy and gluten.',
    ]
  );

  const [p3] = await db.query(
    `INSERT INTO products (seller_id, name, category, description, image_url, original_price, discounted_price, quantity, unit, pickup_location, pickup_start, pickup_end, expiry_date, status, is_eligible_for_donation, safety_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
    [
      seller2Id,
      'Fresh Assam Strawberries & Farm Produce Box (1.2 kg)',
      'Produce & Fruits',
      'Farm fresh strawberries from Meghalaya border orchards paired with crisp local carrots and bell peppers. Slight cosmetic surplus but 100% crunchy and sweet.',
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
      320.00,
      140.00,
      12,
      'box',
      'Green Harvest Organics, Uzan Bazar Ghat Road, Guwahati',
      today.toISOString().slice(0, 19).replace('T', ' '),
      tomorrow.toISOString().slice(0, 19).replace('T', ' '),
      in2Days.toISOString().slice(0, 10),
      1,
      'Wash thoroughly before eating. Store in cool vegetable drawer.',
    ]
  );

  const [p4] = await db.query(
    `INSERT INTO products (seller_id, name, category, description, image_url, original_price, discounted_price, quantity, unit, pickup_location, pickup_start, pickup_end, expiry_date, status, is_eligible_for_donation, safety_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
    [
      seller3Id,
      'Traditional Assam Pitha & Sweet Laru Box (500g)',
      'Dairy & Sweets',
      'Handcrafted authentic Assamese Til Pitha and Narikol Laru made with pure jaggery, coconut, and Bora Saul sticky rice. Surplus celebration batch.',
      'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
      260.00,
      115.00,
      6,
      'box',
      'Assam Sweet Treats, Station Road, Paltan Bazar, Guwahati',
      today.toISOString().slice(0, 19).replace('T', ' '),
      tomorrow.toISOString().slice(0, 19).replace('T', ' '),
      in2Days.toISOString().slice(0, 10),
      1,
      'Store in airtight container at room temperature.',
    ]
  );

  const [p5] = await db.query(
    `INSERT INTO products (seller_id, name, category, description, image_url, original_price, discounted_price, quantity, unit, pickup_location, pickup_start, pickup_end, expiry_date, status, is_eligible_for_donation, safety_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
    [
      seller3Id,
      'Fresh Malai Paneer Block (500g)',
      'Dairy & Sweets',
      'Pure buffalo milk soft malai paneer crafted fresh this morning. Sealed hygienic pack with high protein.',
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
      220.00,
      110.00,
      10,
      'pack',
      'Assam Sweet Treats, Station Road, Paltan Bazar, Guwahati',
      today.toISOString().slice(0, 19).replace('T', ' '),
      todayEnd.toISOString().slice(0, 19).replace('T', ' '),
      tomorrow.toISOString().slice(0, 10),
      0,
      'Must keep refrigerated below 4°C. Consume within 24 hours of opening.',
    ]
  );

  console.log('[Seeder] Inserting sample reservations...');

  // Customer Rahul Goswami reserved 2 boxes of Croissants
  await db.query(
    `INSERT INTO reservations (customer_id, product_id, quantity, unit_price, total_price, status, pickup_code, notes)
     VALUES (?, ?, 2, 120.00, 240.00, 'confirmed', 'ZW-7810-CR01', 'Pickup scheduled for 6:30 PM')`,
    [customerId, p2.insertId]
  );

  // Completed reservation for historical impact stats
  await db.query(
    `INSERT INTO reservations (customer_id, product_id, quantity, unit_price, total_price, status, pickup_code, notes, completed_at)
     VALUES (?, ?, 1, 99.00, 99.00, 'completed', 'ZW-7810-SD99', 'Customer collected at Christian Basti counter', ?)`,
    [customerId, p1.insertId, today.toISOString().slice(0, 19).replace('T', ' ')]
  );

  console.log('[Seeder] Inserting sample NGO donations...');

  // Available donation
  await db.query(
    `INSERT INTO donations (seller_id, product_id, title, category, description, quantity, unit, expiry_date, pickup_location, pickup_deadline, status, safety_certification_acknowledged)
     VALUES (?, ?, 'Multigrain Sandwich Bread Loaves (15 packs)', 'Bakery', 'Freshly baked bakery loaves surplus for hunger relief. Safe, untouched and packaged.', 15, 'packs', ?, 'Brahmaputra Bakers, Christian Basti, Guwahati', ?, 'available', 1)`,
    [
      sellerId,
      p1.insertId,
      tomorrow.toISOString().slice(0, 10),
      tomorrow.toISOString().slice(0, 19).replace('T', ' '),
    ]
  );

  // Requested donation by Assam Food Relief Trust
  await db.query(
    `INSERT INTO donations (seller_id, ngo_id, title, category, description, quantity, unit, expiry_date, pickup_location, pickup_deadline, status, request_notes, safety_certification_acknowledged)
     VALUES (?, ?, 'Fresh Organic Green Spinach & Vegetable Crates (20 kg)', 'Produce & Fruits', 'Nutritious green vegetables collected for community kitchen distribution in Zoo Road slum settlements.', 20, 'kg', ?, 'Green Harvest Organics, Uzan Bazar Ghat, Guwahati', ?, 'requested', 'Volunteers can collect via relief van at 4:00 PM.', 1)`,
    [
      seller2Id,
      ngoId,
      tomorrow.toISOString().slice(0, 10),
      tomorrow.toISOString().slice(0, 19).replace('T', ' '),
    ]
  );

  // Completed donation for historical records
  await db.query(
    `INSERT INTO donations (seller_id, ngo_id, title, category, description, quantity, unit, expiry_date, pickup_location, pickup_deadline, status, request_notes, safety_certification_acknowledged)
     VALUES (?, ?, 'Packaged Dal & Rice Meal Boxes (40 portions)', 'Meals & Cooked', 'Hygienically prepared meal boxes distributed to night shelters near Guwahati Railway Station.', 40, 'boxes', ?, 'Brahmaputra Bakers, Christian Basti, Guwahati', ?, 'completed', 'Collected and distributed successfully by volunteer team.', 1)`,
    [
      sellerId,
      ngoId,
      today.toISOString().slice(0, 10),
      todayEnd.toISOString().slice(0, 19).replace('T', ' '),
    ]
  );

  // Insert initial notifications
  await db.query(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (?, 'Welcome to ZeroWaste Market!', 'Your bakery profile is verified and active in Christian Basti, Guwahati.', 'system')`,
    [sellerId]
  );

  await db.query(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (?, 'New Reservation Confirmed', 'Customer Rahul Goswami reserved 2 items (Code: ZW-7810-CR01).', 'reservation')`,
    [sellerId]
  );

  await db.query(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES (?, 'Donation Request Received', 'Assam Food Relief Trust requested 20 kg Vegetable Crates.', 'donation')`,
    [seller2Id]
  );

  console.log('✅ [Seeder] Database seeding completed successfully!');
  console.log('---------------------------------------------------------');
  console.log('DEMO ACCOUNTS READY:');
  console.log('1. Seller:   seller@zerowaste.in   / Password123!');
  console.log('2. Customer: customer@zerowaste.in / Password123!');
  console.log('3. NGO:      ngo@zerowaste.in      / Password123!');
  console.log('---------------------------------------------------------');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [Seeder] Fatal error:', err);
      process.exit(1);
    });
}

module.exports = seed;
