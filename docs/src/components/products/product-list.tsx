import { Product } from '@shared/schema';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductListProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
}

export function ProductList({ products, onViewDetails }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-4">Nenhum produto encontrado</div>
        <p className="text-slate-600">Tente ajustar os filtros de busca.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120'}
              alt={product.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{product.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-600">
                  R$ {product.finalPrice.toFixed(2).replace('.', ',')}
                </span>
                <Button
                  onClick={() => onViewDetails(product)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
