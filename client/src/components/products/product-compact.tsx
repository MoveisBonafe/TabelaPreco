import { Product } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Função para formatar preços
function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
import { auth } from '@/lib/auth';

interface ProductCompactProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductCompact({ products, onProductClick }: ProductCompactProps) {
  const user = auth.getUser();
  const userMultiplier = getUserMultiplier(user?.permissions?.priceLevel || 'basic');

  return (
    <div className="space-y-2 px-2">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onProductClick(product)}
        >
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              {/* Imagem compacta */}
              <div className="flex-shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Sem foto</span>
                  </div>
                )}
              </div>

              {/* Informações do produto */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {product.category}
                  </Badge>
                  
                  {product.fixedPrice && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      🔒 Fixo
                    </Badge>
                  )}
                </div>

                {/* Preço principal em destaque */}
                <div className="mt-2">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatPrice(calculateUserPrice(product, userMultiplier))}
                  </div>
                  
                  {product.discount > 0 && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="line-through text-gray-500">
                        {formatPrice(product.basePrice * userMultiplier)}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        -{product.discount}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de ação */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">→</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getUserMultiplier(priceLevel: string): number {
  switch (priceLevel) {
    case 'vip': return 1.0;
    case 'premium': return 1.1;
    case 'basic': return 1.2;
    default: return 1.2;
  }
}

function calculateUserPrice(product: Product, multiplier: number): number {
  if (product.fixedPrice) {
    return product.finalPrice;
  }
  return product.finalPrice * multiplier;
}