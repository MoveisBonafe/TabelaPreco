-- Script SQL Simplificado - MoveisBonafe
-- Execute este no SQL Editor do Supabase

-- 1. Criar tabelas básicas
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  fixed_price BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10) DEFAULT '📦',
  color VARCHAR(7) DEFAULT '#3b82f6',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
  price_multiplier DECIMAL(4,2) DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_settings (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL UNIQUE,
  percentage DECIMAL(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir dados iniciais
INSERT INTO auth_users (username, password_hash, name, role, price_multiplier) VALUES
('admin', 'admin123', 'Administrador', 'admin', 1.0),
('vendedor', 'venda123', 'Vendedor', 'seller', 1.0),
('cliente', 'cliente123', 'Cliente', 'customer', 1.0)
ON CONFLICT (username) DO NOTHING;

INSERT INTO price_settings (table_name, percentage) VALUES
('A Vista', 0),
('30', 2),
('30/60', 4),
('30/60/90', 6),
('30/60/90/120', 8)
ON CONFLICT (table_name) DO NOTHING;

INSERT INTO categories (name, icon, color) VALUES
('Sala', '🛋️', '#3b82f6'),
('Quarto', '🛏️', '#10b981'),
('Cozinha', '🍽️', '#f59e0b'),
('Escritório', '💼', '#8b5cf6')
ON CONFLICT (name) DO NOTHING;