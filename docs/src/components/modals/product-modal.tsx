import { X } from 'lucide-react';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/products/price-display';
import { auth } from '@/lib/auth';

interface ProductModalProps {
  product: Product | null;
  isVisible: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isVisible, onClose }: ProductModalProps) {
  if (!isVisible || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-800">Detalhes do Produto</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
            <img 
              src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              style={{ 
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-slate-800">{product.name}</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>
            
            <p className="text-slate-600">{product.description}</p>
            
            {/* Tabelas de Preços */}
            <div className="border-t border-slate-200 pt-6">
              <PriceDisplay product={product} userAuth={auth.getUser()} />
            </div>
            
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-800 mb-2">Especificações</h4>
                <ul className="text-slate-600 text-sm space-y-1">
                  {product.specifications.map((spec, index) => (
                    <li key={index}>• {spec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
