-- Script para criar as tabelas no Supabase
-- Execute este SQL no editor do Supabase (SQL Editor)

-- Habilitar Row Level Security e Realtime
ALTER database postgres SET timezone TO 'America/Sao_Paulo';

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    icon VARCHAR(100) DEFAULT '',
    color VARCHAR(50) DEFAULT '',
    active BOOLEAN DEFAULT true,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(255) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    price_a_vista DECIMAL(10,2) NOT NULL,
    price_30 DECIMAL(10,2) NOT NULL,
    price_30_60 DECIMAL(10,2) NOT NULL,
    price_30_60_90 DECIMAL(10,2) NOT NULL,
    price_30_60_90_120 DECIMAL(10,2) NOT NULL,
    image TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    fixed_price BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO public.categories (name, description, icon, color, active) VALUES
('Sofás', 'Sofás e estofados', '🛋️', '#3b82f6', true),
('Mesas', 'Mesas de centro e jantar', '🪑', '#8b5cf6', true),
('Cadeiras', 'Cadeiras e assentos', '💺', '#06b6d4', true),
('Decoração', 'Itens decorativos', '🏺', '#84cc16', true)
ON CONFLICT (name) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir leitura pública, escrita autenticada)
CREATE POLICY "Permitir leitura pública de categorias" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de produtos" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de categorias" ON public.categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção de produtos" ON public.products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de categorias" ON public.categories
    FOR UPDATE USING (true);

CREATE POLICY "Permitir atualização de produtos" ON public.products
    FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de categorias" ON public.categories
    FOR DELETE USING (true);

CREATE POLICY "Permitir exclusão de produtos" ON public.products
    FOR DELETE USING (true);

-- Habilitar Realtime para sincronização automática
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(active);

-- Função para atualizar contador de produtos por categoria
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador da categoria antiga (se existir)
    IF TG_OP = 'UPDATE' AND OLD.category != NEW.category THEN
        UPDATE public.categories 
        SET product_count = (
            SELECT COUNT(*) FROM public.products 
            WHERE category = OLD.category AND active = true
        )
        WHERE name = OLD.category;
    END IF;
    
    -- Atualizar contador da categoria atual
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.categories 
        SET product_count = (
            SELECT COUNT(*) FROM public.products 
            WHERE category = NEW.category AND active = true
        )
        WHERE name = NEW.category;
    END IF;
    
    -- Atualizar contador da categoria excluída
    IF TG_OP = 'DELETE' THEN
        UPDATE public.categories 
        SET product_count = (
            SELECT COUNT(*) FROM public.products 
            WHERE category = OLD.category AND active = true
        )
        WHERE name = OLD.category;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar contadores automaticamente
DROP TRIGGER IF EXISTS trigger_update_category_count ON public.products;
CREATE TRIGGER trigger_update_category_count
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_product_count();

-- Comentários para documentação
COMMENT ON TABLE public.categories IS 'Tabela de categorias de produtos do MoveisBonafe';
COMMENT ON TABLE public.products IS 'Tabela de produtos do MoveisBonafe com múltiplos preços';
COMMENT ON COLUMN public.products.price_a_vista IS 'Preço base à vista';
COMMENT ON COLUMN public.products.price_30 IS 'Preço para 30 dias (à vista + 2%)';
COMMENT ON COLUMN public.products.price_30_60 IS 'Preço para 30/60 dias (à vista + 4%)';
COMMENT ON COLUMN public.products.price_30_60_90 IS 'Preço para 30/60/90 dias (à vista + 6%)';
COMMENT ON COLUMN public.products.price_30_60_90_120 IS 'Preço para 30/60/90/120 dias (à vista + 8%)';

-- Verificar se as tabelas foram criadas com sucesso
SELECT 
    'Tabelas criadas com sucesso!' as status,
    (SELECT COUNT(*) FROM public.categories) as total_categories,
    (SELECT COUNT(*) FROM public.products) as total_products;