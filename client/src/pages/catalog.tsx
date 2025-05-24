import { useState } from 'react';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductList } from '@/components/products/product-list';
import { ProductCompact } from '@/components/products/product-compact';
import { ProductModal } from '@/components/modals/product-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseProducts, Product as SupabaseProduct } from '@/hooks/use-supabase-products';
import { Product } from '@shared/schema';

interface CatalogProps {
  onShowAdminLogin: () => void;
}

// Convert Supabase product to component-compatible product
const convertSupabaseProduct = (supabaseProduct: SupabaseProduct): Product => ({
  id: supabaseProduct.id.toString(),
  name: supabaseProduct.name,
  description: supabaseProduct.description,
  category: supabaseProduct.category,
  basePrice: supabaseProduct.base_price,
  discount: supabaseProduct.discount,
  finalPrice: supabaseProduct.final_price,
  priceAVista: supabaseProduct.price_a_vista,
  price30: supabaseProduct.price_30,
  price30_60: supabaseProduct.price_30_60,
  price30_60_90: supabaseProduct.price_30_60_90,
  price30_60_90_120: supabaseProduct.price_30_60_90_120,
  image: supabaseProduct.image,
  images: supabaseProduct.images,
  specifications: supabaseProduct.specifications,
  active: supabaseProduct.active,
  fixedPrice: supabaseProduct.fixed_price,
  createdAt: new Date(supabaseProduct.created_at),
});

export function Catalog({ onShowAdminLogin }: CatalogProps) {
  const { products: supabaseProducts, categories, isLoading } = useSupabaseProducts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Convert Supabase products to component-compatible format
  const products = supabaseProducts.map(convertSupabaseProduct);
  const activeProducts = products.filter(p => p.active);

  const filteredProducts = activeProducts
    .filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.finalPrice - b.finalPrice;
        case 'price-high':
          return b.finalPrice - a.finalPrice;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">A-Z</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <ProductGrid
            products={filteredProducts}
            onViewDetails={handleViewProduct}
          />
        ) : (
          <ProductList
            products={filteredProducts}
            onViewDetails={handleViewProduct}
          />
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isVisible={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}
