-- ============================================================
-- Store Rating App - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS store_rating_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_rating_db;

-- ------------------------------------------------------------
-- Users table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  address    VARCHAR(400),
  role       ENUM('admin', 'user', 'owner') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role  (role),
  INDEX idx_users_email (email)
);

-- ------------------------------------------------------------
-- Stores table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400),
  owner_id   INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stores_owner (owner_id),
  INDEX idx_stores_name  (name)
);

-- ------------------------------------------------------------
-- Ratings table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  store_id   INT      NOT NULL,
  user_id    INT      NOT NULL,
  rating     TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_store_user (store_id, user_id),
  CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  INDEX idx_ratings_store (store_id),
  INDEX idx_ratings_user  (user_id)
);

-- ------------------------------------------------------------
-- Default Admin User
-- Email:    admin@admin.com
-- Password: Admin@1234
-- Hash generated with bcrypt, cost factor 10.
-- Change this password immediately after first login!
-- ------------------------------------------------------------
INSERT IGNORE INTO users (name, email, password, role)
VALUES (
  'Default System Administrator',
  'admin@admin.com',
  '$2b$10$gU7SygIetwOXCXVwqQYiwuSaQDwAv1LvvndOusf6KltSKUGfGRini',
  'admin'
);
