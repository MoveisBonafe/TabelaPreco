import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Product, InsertProduct } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFormModal } from '@/components/modals/product-form-modal';
import { useCategories } from '@/hooks/use-categories';

interface ProductsTabProps {
  products: Product[];
  onCreateProduct: (productData: InsertProduct) => void;
  onUpdateProduct: (id: string, productData: Partial<InsertProduct>) => void;
  onDeleteProduct: (id: string) => void;
  onViewProduct: (product: Product) => void;
}

export function ProductsTab({ 
  products, 
  onCreateProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onViewProduct 
}: ProductsTabProps) {
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products
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

  const handleEdit = (product: Product) => {
    setEditingProduct({...product});
    setIsFormModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      onDeleteProduct(product.id);
    }
  };

  const handleSave = (productData: InsertProduct) => {
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
    } else {
      onCreateProduct(productData);
    }
    setEditingProduct(null);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Produtos</h2>
        <Button
          onClick={() => setIsFormModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <SelectItem value="name">Ordenar por nome</SelectItem>
              <SelectItem value="price-low">Menor preço</SelectItem>
              <SelectItem value="price-high">Maior preço</SelectItem>
              <SelectItem value="category">Ordenar por categoria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={filteredProducts}
        onViewDetails={onViewProduct}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdmin={true}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        product={editingProduct}
        isVisible={isFormModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
