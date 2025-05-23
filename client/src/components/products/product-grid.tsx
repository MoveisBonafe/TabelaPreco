import { Product } from '@shared/schema';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGridProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  isAdmin?: boolean;
}

export function ProductGrid({ products, onViewDetails, onEdit, onDelete, isAdmin }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-4">Nenhum produto encontrado</div>
        <p className="text-slate-600">Tente ajustar os filtros de busca ou adicione novos produtos.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      isAdmin 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
        >
          <div className="w-full h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              style={{ 
                objectFit: 'contain', 
                width: 'auto', 
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
          <div className={isAdmin ? 'p-6' : 'p-4'}>
            <div className="flex items-start justify-between mb-3">
              <h3 className={`font-semibold text-slate-800 ${isAdmin ? '' : 'text-sm'}`}>
                {product.name}
              </h3>
              <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded-full ${isAdmin ? 'text-xs' : 'text-xs'}`}>
                {product.category}
              </span>
            </div>
            <p className={`text-slate-600 mb-4 line-clamp-2 ${isAdmin ? 'text-sm' : 'text-xs'}`}>
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-emerald-600 ${isAdmin ? 'text-lg' : 'text-lg'}`}>
                R$ {product.finalPrice.toFixed(2).replace('.', ',')}
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(product)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {isAdmin && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {isAdmin && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
