-- Script SQL para configurar o Supabase - MoveisBonafe
-- Execute este script no SQL Editor do seu painel Supabase

-- 1. Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  images JSONB DEFAULT '[]',
  fixed_price BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  height DECIMAL(8,2),
  width DECIMAL(8,2),
  length DECIMAL(8,2),
  weight DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10) DEFAULT '📦',
  color VARCHAR(7) DEFAULT '#3b82f6',
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Usuários para Autenticação
CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
  price_multiplier DECIMAL(4,2) DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de Configurações de Preços
CREATE TABLE IF NOT EXISTS price_settings (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL UNIQUE,
  percentage DECIMAL(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Inserir dados padrão

-- Usuários padrão
INSERT INTO auth_users (username, password_hash, name, role, price_multiplier) VALUES
('admin', 'admin123', 'Administrador', 'admin', 1.0),
('vendedor', 'venda123', 'Vendedor', 'seller', 1.0),
('cliente', 'cliente123', 'Cliente Teste', 'customer', 1.0)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  price_multiplier = EXCLUDED.price_multiplier;

-- Configurações de preços padrão
INSERT INTO price_settings (table_name, percentage) VALUES
('A Vista', 0),
('30', 2),
('30/60', 4),
('30/60/90', 6),
('30/60/90/120', 8)
ON CONFLICT (table_name) DO UPDATE SET
  percentage = EXCLUDED.percentage;

-- Categorias padrão
INSERT INTO categories (name, icon, color, image) VALUES
('Sala de Estar', '🛋️', '#3b82f6', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop'),
('Quarto', '🛏️', '#10b981', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop'),
('Cozinha', '🍽️', '#f59e0b', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop'),
('Escritório', '💼', '#8b5cf6', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop')
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  image = EXCLUDED.image;

-- 6. Habilitar RLS (Row Level Security) - Opcional para segurança
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_settings ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acesso público (para simplificar)
-- IMPORTANTE: Em produção, configure políticas mais restritivas

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON auth_users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON auth_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON auth_users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON auth_users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON price_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON price_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON price_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON price_settings FOR DELETE USING (true);

-- Script concluído! 
-- Seu banco Supabase está configurado para o sistema MoveisBonafe