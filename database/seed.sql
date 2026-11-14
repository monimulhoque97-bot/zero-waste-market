-- ==============================================================================
-- ZERO WASTE MARKET - GUWAHATI, ASSAM, INDIA
-- SQL Seed File for MySQL 8.0+
-- Passwords below are hashed for 'Password123!'
-- ==============================================================================

USE zerowaste_market;

-- 1. DEMO USERS
-- Password hash is bcrypt for 'Password123!'
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(1, 'Priyanka Sarma', 'seller@zerowaste.in', '$2a$10$iI.Uu4uH/qXpQ6Qz.hW6wO1k9bJm5uI2aR8hO7eG6wV3mO2aQ8v8i', 'seller', '+91 98640 12345'),
(2, 'Rahul Goswami', 'customer@zerowaste.in', '$2a$10$iI.Uu4uH/qXpQ6Qz.hW6wO1k9bJm5uI2aR8hO7eG6wV3mO2aQ8v8i', 'customer', '+91 94350 98765'),
(3, 'Anjali Baruah', 'ngo@zerowaste.in', '$2a$10$iI.Uu4uH/qXpQ6Qz.hW6wO1k9bJm5uI2aR8hO7eG6wV3mO2aQ8v8i', 'ngo', '+91 91270 45678'),
(4, 'Bhaskar Das', 'harvest@zerowaste.in', '$2a$10$iI.Uu4uH/qXpQ6Qz.hW6wO1k9bJm5uI2aR8hO7eG6wV3mO2aQ8v8i', 'seller', '+91 98641 55667'),
(5, 'Manasjyoti Kalita', 'sweets@zerowaste.in', '$2a$10$iI.Uu4uH/qXpQ6Qz.hW6wO1k9bJm5uI2aR8hO7eG6wV3mO2aQ8v8i', 'seller', '+91 94351 22334');

-- 2. SELLER PROFILES
INSERT INTO seller_profiles (user_id, business_name, business_address, locality, city, state, pin_code, business_type, fssai_license) VALUES
(1, 'Brahmaputra Bakers & Cafe', 'Shop 14, Central Mall Arcade, GS Road', 'Christian Basti', 'Guwahati', 'Assam', '781005', 'Bakery & Confectionery', '10321999000123'),
(4, 'Green Harvest Organic Mart', 'Uzan Bazar Ghat Road, Near Brahmaputra View', 'Uzan Bazar', 'Guwahati', 'Assam', '781001', 'Produce & Organic Grocery', '10322888000456'),
(5, 'Assam Sweet Treats & Dairy', 'Station Road, Paltan Bazar', 'Paltan Bazar', 'Guwahati', 'Assam', '781008', 'Traditional Dairy & Sweets', '10323777000789');

-- 3. NGO PROFILES
INSERT INTO ngo_profiles (user_id, org_name, registration_number, verification_status, cause_area, address, contact_person, website) VALUES
(3, 'Assam Food Relief & Seva Trust', 'KAM-METRO-NGO-2019-4821', 'verified', 'Food Relief & Community Kitchens', 'Sector 4, Zoo-Narengi Road, Guwahati', 'Anjali Baruah (Director)', 'https://assamfoodrelief.org');

-- 4. PRODUCTS
INSERT INTO products (id, seller_id, name, category, description, image_url, original_price, discounted_price, quantity, unit, pickup_location, pickup_start, pickup_end, expiry_date, status, is_eligible_for_donation, safety_notes) VALUES
(1, 1, 'Artisan Sourdough Loaves (Pack of 2)', 'Bakery', 'Freshly baked European style sourdough loaves. Baked this morning with organic wheat flour, crisp crust and airy crumb.', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80', 240.00, 99.00, 8, 'pack', 'Brahmaputra Bakers, GS Road, Christian Basti, Guwahati', NOW(), DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'available', 1, 'Keep refrigerated or consume within 48 hours. Baked fresh daily.'),
(2, 1, 'Butter Croissant Box (Assorted 4 pcs)', 'Bakery', 'Golden, flaky French butter croissants filled with light chocolate and plain butter layers. Surplus afternoon batch.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 280.00, 120.00, 5, 'box', 'Brahmaputra Bakers, GS Road, Christian Basti, Guwahati', NOW(), DATE_ADD(NOW(), INTERVAL 7 HOUR), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'available', 1, 'Best enjoyed warmed. Contains dairy and gluten.'),
(3, 4, 'Fresh Assam Strawberries & Farm Produce Box (1.2 kg)', 'Produce & Fruits', 'Farm fresh strawberries from Meghalaya border orchards paired with crisp local carrots and bell peppers.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80', 320.00, 140.00, 12, 'box', 'Green Harvest Organics, Uzan Bazar Ghat Road, Guwahati', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'available', 1, 'Wash thoroughly before eating. Store in cool vegetable drawer.'),
(4, 5, 'Traditional Assam Pitha & Sweet Laru Box (500g)', 'Dairy & Sweets', 'Handcrafted authentic Assamese Til Pitha and Narikol Laru made with pure jaggery, coconut, and Bora Saul sticky rice.', 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80', 260.00, 115.00, 6, 'box', 'Assam Sweet Treats, Station Road, Paltan Bazar, Guwahati', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'available', 1, 'Store in airtight container at room temperature.'),
(5, 5, 'Fresh Malai Paneer Block (500g)', 'Dairy & Sweets', 'Pure buffalo milk soft malai paneer crafted fresh this morning. Sealed hygienic pack with high protein.', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', 220.00, 110.00, 10, 'pack', 'Assam Sweet Treats, Station Road, Paltan Bazar, Guwahati', NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'available', 0, 'Must keep refrigerated below 4°C. Consume within 24 hours of opening.');

-- 5. SAMPLE RESERVATIONS
INSERT INTO reservations (customer_id, product_id, quantity, unit_price, total_price, status, pickup_code, notes) VALUES
(2, 2, 2, 120.00, 240.00, 'confirmed', 'ZW-7810-CR01', 'Pickup scheduled for 6:30 PM');

INSERT INTO reservations (customer_id, product_id, quantity, unit_price, total_price, status, pickup_code, notes, completed_at) VALUES
(2, 1, 1, 99.00, 99.00, 'completed', 'ZW-7810-SD99', 'Customer collected at Christian Basti counter', NOW());

-- 6. SAMPLE DONATIONS
INSERT INTO donations (seller_id, product_id, title, category, description, quantity, unit, expiry_date, pickup_location, pickup_deadline, status, safety_certification_acknowledged) VALUES
(1, 1, 'Multigrain Sandwich Bread Loaves (15 packs)', 'Bakery', 'Freshly baked bakery loaves surplus for hunger relief. Safe, untouched and packaged.', 15, 'packs', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Brahmaputra Bakers, Christian Basti, Guwahati', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'available', 1);

INSERT INTO donations (seller_id, ngo_id, title, category, description, quantity, unit, expiry_date, pickup_location, pickup_deadline, status, request_notes, safety_certification_acknowledged) VALUES
(4, 3, 'Fresh Organic Green Spinach & Vegetable Crates (20 kg)', 'Produce & Fruits', 'Nutritious green vegetables collected for community kitchen distribution in Zoo Road settlements.', 20, 'kg', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Green Harvest Organics, Uzan Bazar Ghat, Guwahati', DATE_ADD(NOW(), INTERVAL 24 HOUR), 'requested', 'Volunteers can collect via relief van at 4:00 PM.', 1);

INSERT INTO donations (seller_id, ngo_id, title, category, description, quantity, unit, expiry_date, pickup_location, pickup_deadline, status, request_notes, safety_certification_acknowledged) VALUES
(1, 3, 'Packaged Dal & Rice Meal Boxes (40 portions)', 'Meals & Cooked', 'Hygienically prepared meal boxes distributed to night shelters near Guwahati Railway Station.', 40, 'boxes', CURDATE(), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'completed', 'Collected and distributed successfully by volunteer team.', 1);
