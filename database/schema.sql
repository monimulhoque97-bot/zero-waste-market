-- ==============================================================================
-- ZERO WASTE MARKET - GUWAHATI, ASSAM, INDIA
-- Relational Database Schema (MySQL 8.0+ compatible)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS zerowaste_market
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE zerowaste_market;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('seller', 'customer', 'ngo') NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. SELLER PROFILES TABLE
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_seller_locality (locality)
) ENGINE=InnoDB;

-- 3. NGO PROFILES TABLE
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ngo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ngo_verification (verification_status)
) ENGINE=InnoDB;

-- 4. PRODUCTS TABLE
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product_seller (seller_id),
  INDEX idx_product_category (category),
  INDEX idx_product_status (status),
  INDEX idx_product_pickup_end (pickup_end)
) ENGINE=InnoDB;

-- 5. RESERVATIONS TABLE
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
  notes TEXT,
  CONSTRAINT fk_reservation_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reservation_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_reservation_customer (customer_id),
  INDEX idx_reservation_product (product_id),
  INDEX idx_reservation_status (status)
) ENGINE=InnoDB;

-- 6. DONATIONS TABLE
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donation_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_donation_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_donation_ngo FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_donation_seller (seller_id),
  INDEX idx_donation_ngo (ngo_id),
  INDEX idx_donation_status (status)
) ENGINE=InnoDB;

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('reservation', 'donation', 'alert', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notification_user (user_id, is_read)
) ENGINE=InnoDB;
